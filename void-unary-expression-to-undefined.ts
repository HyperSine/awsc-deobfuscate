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
            UnaryExpression(path: traverse.NodePath<types.UnaryExpression>, state) {
                if (path.node.operator !== 'void') {
                    return; // skip
                }

                if (path.get('argument').isLiteral()) {
                    path.replaceWith(types.identifier('undefined'));
                    ++state.count;
                    return;
                }

                throw new Error(`unhandled situation: ${path.parentPath.type}: ${path.parentPath}`);
            }
        },
        undefined,
        opt_result
    );

    console.log(`[*] optimized ${opt_result.count} void-expression(s)`);
    fs.writeFileSync(args.OUTFILE, generator.default(program_ast).code);
}

if (require.main === module) {
    main();
}
