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

    const opt_result = {
        countof_if: 0,
        countof_if_consequent: 0,
        countof_if_alternate: 0,

        countof_for: 0,
        countof_for_in: 0,
        countof_for_of: 0,

        countof_while: 0,
        countof_do_while: 0,
    };

    traverse.default(
        program_ast,
        {
            IfStatement: {
                exit(path: traverse.NodePath<types.IfStatement>, state) {
                    let updated = false;

                    const consequent = path.get('consequent');
                    const alternate = path.get('alternate');

                    if (!consequent.isBlockStatement()) {
                        consequent.replaceWith(types.blockStatement([types.cloneDeepWithoutLoc(consequent.node)]));
                        ++state.countof_if_consequent;
                        updated = true;
                    }

                    if (alternate.hasNode() && !alternate.isBlockStatement()) {
                        alternate.replaceWith(types.blockStatement([types.cloneDeepWithoutLoc(alternate.node)]));
                        ++state.countof_if_alternate;
                        updated = true;
                    }

                    if (updated) {
                        ++state.countof_if;
                    }
                }
            },
            ForStatement(path: traverse.NodePath<types.ForStatement>, state) {
                const body = path.get('body');
                if (!body.isBlockStatement()) {
                    body.replaceWith(types.blockStatement([types.cloneDeepWithoutLoc(body.node)]));
                    ++state.countof_for;
                }
            },
            ForInStatement(path: traverse.NodePath<types.ForInStatement>, state) {
                const body = path.get('body');
                if (!body.isBlockStatement()) {
                    body.replaceWith(types.blockStatement([types.cloneDeepWithoutLoc(body.node)]));
                    ++state.countof_for_in;
                }
            },
            ForOfStatement(path: traverse.NodePath<types.ForOfStatement>, state) {
                const body = path.get('body');
                if (!body.isBlockStatement()) {
                    body.replaceWith(types.blockStatement([types.cloneDeepWithoutLoc(body.node)]));
                    ++state.countof_for_of;
                }
            },
            WhileStatement(path: traverse.NodePath<types.WhileStatement>, state) {
                const body = path.get('body');
                if (!body.isBlockStatement()) {
                    body.replaceWith(types.blockStatement([types.cloneDeepWithoutLoc(body.node)]));
                    ++state.countof_while;
                }
            },
            DoWhileStatement(path: traverse.NodePath<types.DoWhileStatement>, state) {
                const body = path.get('body');
                if (!body.isBlockStatement()) {
                    body.replaceWith(types.blockStatement([types.cloneDeepWithoutLoc(body.node)]));
                    ++state.countof_do_while;
                }
            }
        },
        undefined,
        opt_result
    );

    console.log(`[*] optimized ${opt_result.countof_if} IfStatement(s): ${opt_result.countof_if_consequent} consequent(s), ${opt_result.countof_if_alternate} alternate(s)`);
    console.log(`[*] optimized ${opt_result.countof_for} ForStatement(s)`);
    console.log(`[*] optimized ${opt_result.countof_for_in} ForInStatement(s)`);
    console.log(`[*] optimized ${opt_result.countof_for_of} ForOfStatement(s)`);
    console.log(`[*] optimized ${opt_result.countof_while} WhileStatement(s)`);
    console.log(`[*] optimized ${opt_result.countof_do_while} DoWhileStatement(s)`);

    fs.writeFileSync(args.OUTFILE, generator.default(program_ast).code);
}

if (require.main === module) {
    main();
}
