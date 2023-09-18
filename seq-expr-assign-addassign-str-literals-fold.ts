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
                const _expressions = path.get('expressions');

                const _assign_expressions = [];
                const _addassign_expressions = [];

                for (let i = 0; i < _expressions.length; ++i) {
                    const first_expression = _expressions[i];
                    if (!first_expression.isAssignmentExpression({ operator: '=' })) {
                        continue;
                    }

                    const first_left = first_expression.get('left');
                    const first_right = first_expression.get('right');
                    if (!first_left.isIdentifier()) {
                        continue;
                    }
                    if (!first_right.isStringLiteral()) {
                        continue;
                    }

                    if (i + 1 < _expressions.length) {
                        const second_expression = _expressions[i + 1];
                        if (!second_expression.isAssignmentExpression({ operator: '+=' })) {
                            continue;
                        }

                        const second_left = second_expression.get('left');
                        const second_right = second_expression.get('right');
                        if (!second_left.isIdentifier({ name: first_left.node.name })) {
                            continue;
                        }
                        if (!second_right.isStringLiteral()) {
                            continue;
                        }

                        _assign_expressions.push(first_expression);
                        _addassign_expressions.push(second_expression);
                        i = i + 1;
                    }
                }

                for (let i = 0; i < _assign_expressions.length; ++i) {
                    const sl1 = _assign_expressions[i].node.right as types.StringLiteral;
                    const sl2 = _addassign_expressions[i].node.right as types.StringLiteral;
                    _assign_expressions[i].get('right').replaceWith(types.stringLiteral(sl1.value + sl2.value));
                    _addassign_expressions[i].remove();
                }

                state.count += _assign_expressions.length;
            }
        },
        undefined,
        opt_result
    );

    console.log(`[*] optimized ${opt_result.count} assign-assignment pair(s)`);
    fs.writeFileSync(args.OUTFILE, generator.default(program_ast).code);
}

if (require.main === module) {
    main();
}
