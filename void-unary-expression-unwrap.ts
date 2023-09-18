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

    // traverse.default(
    //     program_ast,
    //     {
    //         ExpressionStatement(path: traverse.NodePath<types.ExpressionStatement>, state) {
    //             const expression = path.get('expression');
    //             if (expression.isUnaryExpression({ operator: 'void' })) {
    //                 path.replaceWith(types.cloneDeepWithoutLoc(expression.node.argument));
    //                 ++state.count;
    //             }
    //         }
    //     },
    //     undefined,
    //     opt_result
    // );

    traverse.default(
        program_ast,
        {
            UnaryExpression: {
                exit(path, state) {
                    if (path.node.operator !== 'void') {
                        return; // skip
                    }

                    if (path.parentPath.isAssignmentExpression() && path.parentPath.get('right').node === path.node) {
                        return; // skip
                    }

                    if (path.parentPath.isBinaryExpression()) {
                        const parent_left = path.parentPath.get('left');
                        const parent_right = path.parentPath.get('right');
                        assert.ok(path.node === parent_left.node || path.node === parent_right.node);
                        return; // skip
                    }

                    if (path.parentPath.isExpressionStatement()) {
                        path.replaceWith(types.cloneDeepWithoutLoc(path.get('argument').node));
                        ++state.count;
                        return;
                    }

                    if (path.parentPath.isSequenceExpression()) {
                        const last_expression = path.parentPath.get('expressions').at(-1);
                        assert.ok(last_expression != null);

                        if (last_expression.node !== path.node) {
                            path.replaceWith(types.cloneDeepWithoutLoc(path.get('argument').node));
                            ++state.count;
                            return;
                        } else {
                            if (path.parentPath.parentPath.isExpressionStatement()) {
                                path.replaceWith(types.cloneDeepWithoutLoc(path.get('argument').node));
                                ++state.count;
                                return;
                            } else {
                                return; // skip
                            }
                        }
                    }

                    throw new Error(`unhandled situation: ${path.parentPath.type}: ${path.parentPath}`);
                }
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
