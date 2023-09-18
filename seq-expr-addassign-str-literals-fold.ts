import * as assert from 'node:assert';
import * as fs from "node:fs";
import * as argparse from 'argparse';

import * as types from '@babel/types';
import * as parser from '@babel/parser';
import * as traverse from '@babel/traverse';
import * as generator from '@babel/generator';

function main() {
    const args_parser = new argparse.ArgumentParser();

    args_parser.add_argument('INFILE', { help: 'obfuscated js file path' });
    args_parser.add_argument('OUTFILE', { help: 'deobfuscated js file path' });

    const args = args_parser.parse_args();
    const program_ast = parser.parse(fs.readFileSync(args.INFILE, { encoding: 'utf-8' }));

    const opt_result = { count: 0 };

    traverse.default(
        program_ast,
        {
            SequenceExpression(path: traverse.NodePath<types.SequenceExpression>, state) {
                const remove_indexes: number[] = [];
                const seq_expressions = path.get('expressions');

                for (let i = 0; i < seq_expressions.length; ++i) {
                    const first_addassign = seq_expressions[i];
                    if (!first_addassign.isAssignmentExpression({ operator: '+=' })) {
                        continue;
                    }

                    const first_addassign_left = first_addassign.get('left');
                    if (!first_addassign_left.isIdentifier()) {
                        continue;
                    }

                    const first_addassign_right = first_addassign.get('right');
                    if (!first_addassign_right.isStringLiteral()) {
                        continue;
                    }

                    const string_literals = [first_addassign_right.node.value];

                    let j = i + 1;
                    for (; j < seq_expressions.length; ++j) {
                        const left_addassign = seq_expressions[j];
                        if (!left_addassign.isAssignmentExpression({ operator: '+=' })) {
                            break;
                        }

                        const left_addassign_left = left_addassign.get('left');
                        if (!left_addassign_left.isIdentifier({ name: first_addassign_left.node.name })) {
                            break;
                        }

                        const left_addassign_right = left_addassign.get('right');
                        if (!left_addassign_right.isStringLiteral()) {
                            break;
                        }

                        remove_indexes.push(j);
                        string_literals.push(left_addassign_right.node.value);
                    }
                    i = j - 1;

                    if (string_literals.length > 1) {
                        first_addassign_right.replaceWith(types.stringLiteral(string_literals.join('')));
                    }
                }

                if (remove_indexes.length > 0) {
                    state.count += remove_indexes.length;
                    remove_indexes.toReversed().forEach(i => seq_expressions[i].remove());
                }
            }
        },
        undefined,
        opt_result
    );

    console.log(`[*] optimized ${opt_result.count} assignment expression(s)`);
    fs.writeFileSync(args.OUTFILE, generator.default(program_ast).code);
}

if (require.main === module) {
    main();
}
