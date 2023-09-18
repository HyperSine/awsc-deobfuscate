import * as assert from 'node:assert';
import * as fs from "node:fs";

import * as argparse from 'argparse';

import * as types from '@babel/types';
import * as parser from "@babel/parser";
import * as traverse from '@babel/traverse';
import * as generator from '@babel/generator';

function isMemberExpressionCall(node: types.Node, name: string): node is types.CallExpression & { callee: types.MemberExpression };

function isMemberExpressionCall(path: traverse.NodePath, name: string): path is traverse.NodePath<types.CallExpression & { callee: types.MemberExpression }>;

function isMemberExpressionCall(node: types.Node | traverse.NodePath, name: string): boolean {
    if (node instanceof traverse.NodePath) {
        return isMemberExpressionCall(node.node, name);
    } else {
        return types.isCallExpression(node) && types.isMemberExpression(node.callee) && types.isIdentifier(node.callee.property, { name: name });
    }
}

function isSplitReverseJoinCall(node: types.Node): node is types.CallExpression & { callee: types.MemberExpression } {
    console.log(node.type);
    // check if `.join('')`
    if (isMemberExpressionCall(node, 'join') && node.arguments.length === 1 && types.isStringLiteral(node.arguments[0], { value: '' })) {
        // pass
        console.log('fuck1');
    } else {
        return false;
    }

    // check if `.reverse()`
    if (isMemberExpressionCall(node.callee.object, 'reverse') && node.callee.object.arguments.length === 0) {
        // pass
        console.log('fuck2');
    } else {
        return false;
    }

    // check if `.split('')`
    return isMemberExpressionCall(node.callee.object.callee.object, 'split')
        && node.callee.object.callee.object.arguments.length === 1
        && types.isStringLiteral(node.callee.object.callee.object.arguments[0], { value: '' });
}

function hoistAssignmentExpression(path: traverse.NodePath, assignment_paths: traverse.NodePath<types.AssignmentExpression>[], assignment_exprs: types.AssignmentExpression[]): types.Node {
    if (assignment_paths.some(p => p.node === path.node || p.isDescendant(path))) {
        if (path.isAssignmentExpression()) {
            const _left = path.get('left');
            const _right = path.get('right');

            let left_;
            if (assignment_paths.some(p => p.isDescendant(_left))) {
                left_ = hoistAssignmentExpression(_left, assignment_paths, assignment_exprs) as typeof _left.node;
                assert.ok(types.isLVal(left_));
            } else {
                left_ = types.cloneDeepWithoutLoc(_left.node);
            }

            let right_;
            if (assignment_paths.some(p => p.node === _right.node || p.isDescendant(_right))) {
                right_ = hoistAssignmentExpression(_right, assignment_paths, assignment_exprs) as typeof _right.node;
                assert.ok(types.isExpression(right_));
            } else {
                right_ = types.cloneDeepWithoutLoc(_right.node);
            }

            assignment_exprs.push(types.assignmentExpression(path.node.operator, left_, right_));

            return left_;
        } else if (path.isUnaryExpression()) {
            const _argument = path.get('argument');

            let argument_;
            if (assignment_paths.some(p => p.node === _argument.node || p.isDescendant(_argument))) {
                argument_ = hoistAssignmentExpression(_argument, assignment_paths, assignment_exprs) as typeof _argument.node;
            } else {
                argument_ = types.cloneDeepWithoutLoc(_argument.node);
            }

            return types.unaryExpression(path.node.operator, argument_, path.node.prefix);
        } else if (path.isBinaryExpression()) {
            const _left = path.get('left');
            const _right = path.get('right');

            let left_;
            if (assignment_paths.some(p => p.node === _left.node || p.isDescendant(_left))) {
                left_ = hoistAssignmentExpression(_left, assignment_paths, assignment_exprs) as typeof _left.node;
            } else {
                left_ = types.cloneDeepWithoutLoc(_left.node);
            }

            let right_;
            if (assignment_paths.some(p => p.node === _right.node || p.isDescendant(_right))) {
                right_ = hoistAssignmentExpression(_right, assignment_paths, assignment_exprs) as typeof _right.node;
            } else {
                right_ = types.cloneDeepWithoutLoc(_right.node);
            }

            return types.binaryExpression(path.node.operator, left_, right_);
        } else if (path.isLogicalExpression()) {
            const _left = path.get('left');
            const _right = path.get('right');

            let left_;
            if (assignment_paths.some(p => p.node === _left.node || p.isDescendant(_left))) {
                left_ = hoistAssignmentExpression(_left, assignment_paths, assignment_exprs) as typeof _left.node;
            } else {
                left_ = types.cloneDeepWithoutLoc(_left.node);
            }

            assert.ok(!assignment_paths.some(p => p.node === _right.node || p.isDescendant(_right)), 'not implemented: an assignment expression is in the `right` of a LogicalExpression');

            return types.logicalExpression(path.node.operator, left_, types.cloneDeepWithoutLoc(_right.node));
        } else if (path.isConditionalExpression()) {
            const _test = path.get('test');
            const _consequent = path.get('consequent');
            const _alternate = path.get('alternate');

            let test_;
            if (assignment_paths.some(p => p.node === _test.node || p.isDescendant(_test))) {
                test_ = hoistAssignmentExpression(_test, assignment_paths, assignment_exprs) as typeof _test.node;
            } else {
                test_ = types.cloneDeepWithoutLoc(_test.node);
            }

            assert.ok(!assignment_paths.some(p => p.node === _consequent.node || p.isDescendant(_consequent)), 'not implemented: an assignment expression is in the `consequent` branch of a ConditionalExpression.');
            assert.ok(!assignment_paths.some(p => p.node === _alternate.node || p.isDescendant(_alternate)), 'not implemented: an assignment expression is in the `alternate` branch of a ConditionalExpression.');

            return types.conditionalExpression(test_, types.cloneDeepWithoutLoc(_consequent.node), types.cloneDeepWithoutLoc(_alternate.node));
        } else if (path.isUpdateExpression()) {
            const _argument = path.get('argument');

            let argument_;
            if (assignment_paths.some(p => p.node === _argument.node || p.isDescendant(_argument))) {
                argument_ = hoistAssignmentExpression(_argument, assignment_paths, assignment_exprs) as typeof _argument.node;
            } else {
                argument_ = types.cloneDeepWithoutLoc(_argument.node);
            }

            return types.updateExpression(path.node.operator, argument_, path.node.prefix);
        } else if (path.isMemberExpression()) {
            const _object = path.get('object');
            const _property = path.get('property');

            let object_;
            if (assignment_paths.some(p => p.node === _object.node || p.isDescendant(_object))) {
                object_ = hoistAssignmentExpression(_object, assignment_paths, assignment_exprs) as typeof _object.node;
            } else {
                object_ = types.cloneDeepWithoutLoc(_object.node);
            }

            let property_;
            if (assignment_paths.some(p => p.node === _property.node || p.isDescendant(_property))) {
                property_ = hoistAssignmentExpression(_property, assignment_paths, assignment_exprs) as typeof _property.node;
            } else {
                property_ = types.cloneDeepWithoutLoc(_property.node);
            }

            return types.memberExpression(object_, property_, path.node.computed, path.node.optional);
        } else if (path.isCallExpression()) {
            const _callee = path.get('callee');
            const _arguments = path.get('arguments');

            let callee_;
            if (assignment_paths.some(p => p.node === _callee.node || p.isDescendant(_callee))) {
                callee_ = hoistAssignmentExpression(_callee, assignment_paths, assignment_exprs) as typeof _callee.node;
            } else {
                callee_ = types.cloneDeepWithoutLoc(_callee.node);
            }

            let arguments_ = [];
            for (let _arg of _arguments) {
                if (assignment_paths.some(p => p.node === _arg.node || p.isDescendant(_arg))) {
                    arguments_.push(hoistAssignmentExpression(_arg, assignment_paths, assignment_exprs) as typeof _arg.node);
                } else {
                    arguments_.push(types.cloneDeepWithoutLoc(_arg.node));
                }
            }

            return types.callExpression(callee_, arguments_);
        } else if (path.isNewExpression()) {
            const _callee = path.get('callee');
            const _arguments = path.get('arguments');

            let callee_;
            if (assignment_paths.some(p => p.node === _callee.node || p.isDescendant(_callee))) {
                callee_ = hoistAssignmentExpression(_callee, assignment_paths, assignment_exprs) as typeof _callee.node;
            } else {
                callee_ = types.cloneDeepWithoutLoc(_callee.node);
            }

            let arguments_ = [];
            for (let _arg of _arguments) {
                if (assignment_paths.some(p => p.node === _arg.node || p.isDescendant(_arg))) {
                    arguments_.push(hoistAssignmentExpression(_arg, assignment_paths, assignment_exprs) as typeof _arg.node);
                } else {
                    arguments_.push(types.cloneDeepWithoutLoc(_arg.node));
                }
            }

            return types.newExpression(callee_, arguments_);
        } else if (path.isArrayExpression()) {
            const _elements = path.get('elements');

            let elements_ = [];
            for (let _elem of _elements) {
                if (_elem.node == null) {
                    elements_.push(null);
                } else {
                    if (assignment_paths.some(p => p.node === _elem.node || p.isDescendant(_elem as traverse.NodePath))) {
                        elements_.push(hoistAssignmentExpression(_elem as traverse.NodePath, assignment_paths, assignment_exprs) as typeof _elem.node);
                    } else {
                        elements_.push(types.cloneDeepWithoutLoc(_elem.node));
                    }
                }
            }

            return types.arrayExpression(elements_);
        } else {
            throw Error(`Not implemented: ${path.type}: ${path}`);
        }
    } else {
        return types.cloneDeepWithoutLoc(path.node);
    }
}

function main() {
    const args_parser = new argparse.ArgumentParser();

    args_parser.add_argument('INFILE', { help: 'obfuscated js file path' });
    args_parser.add_argument('OUTFILE', { help: 'deobfuscated js file path' });

    const args = args_parser.parse_args();
    const program_ast = parser.parse(fs.readFileSync(args.INFILE, { encoding: 'utf-8' }));

    const opt_result = { count_in_vardecl: 0, count_in_seqexpr: 0, count_in_others: 0 };

    traverse.default(
        program_ast,
        {
            VariableDeclaration(path: traverse.NodePath<types.VariableDeclaration>, state) {
                if (path.node.kind === 'var') {
                    const decl_map = new Map<string, traverse.NodePath<types.VariableDeclarator>>();
                    for (let declaration of path.get('declarations')) {
                        const id = declaration.get('id');
                        const init = declaration.get('init');

                        assert.ok(id.isIdentifier());

                        if (init.node == null) {
                            assert.ok(!decl_map.has(id.node.name));
                            decl_map.set(id.node.name, declaration);
                        } else {
                            const assignment_paths: traverse.NodePath<types.AssignmentExpression>[] = [];

                            if (init.isAssignmentExpression()) {
                                assignment_paths.push(init);
                            }

                            init.traverse({
                                AssignmentExpression(path: traverse.NodePath<types.AssignmentExpression>) {
                                    assignment_paths.push(path);
                                },
                                FunctionExpression(path: traverse.NodePath<types.FunctionExpression>) {
                                    path.skip();
                                }
                            });

                            if (assignment_paths.length > 0) {
                                const assignment_exprs: types.AssignmentExpression[] = [];

                                const new_expression = hoistAssignmentExpression(init as traverse.NodePath<types.Expression>, assignment_paths, assignment_exprs) as types.Expression;
                                assert.ok(assignment_exprs.length > 0);

                                for (let assignment_expr of assignment_exprs) {
                                    if (!types.isIdentifier(assignment_expr.left)) {
                                        //console.log(`[*] hoist \`${generator.default(assignment_expr).code}\` before \`${path}\``);

                                        path.insertBefore(types.expressionStatement(assignment_expr));

                                        ++state.count_in_vardecl;
                                        continue;
                                    }

                                    const prev_declaration = decl_map.get(assignment_expr.left.name);
                                    if (prev_declaration == null) {
                                        //console.log(`[*] hoist \`${generator.default(assignment_expr).code}\` before \`${path}\``);

                                        path.insertBefore(types.expressionStatement(assignment_expr));

                                        ++state.count_in_vardecl;
                                        continue;
                                    }

                                    const prev_init = prev_declaration.get('init');
                                    assert.ok(prev_init.hasNode());

                                    if (assignment_expr.operator === '+=' && types.isStringLiteral(assignment_expr.right)) {
                                        assert.ok(prev_init.isStringLiteral(), `not implemented: try to merge \`${prev_declaration}\` and \`${generator.default(assignment_expr).code}\``);

                                        //console.log(`[*] merge \`${prev_declaration}\` and \`${generator.default(assignment_expr).code}\``);
                                        prev_init.replaceWith(types.stringLiteral(prev_init.node.value + assignment_expr.right.value));

                                        ++state.count_in_vardecl;
                                        continue;
                                    }

                                    throw new Error(`not implemented: ${generator.default(assignment_expr).code}`);
                                }

                                init.replaceWith(new_expression);
                            }

                            assert.ok(!decl_map.has(id.node.name));
                            decl_map.set(id.node.name, declaration);
                        }
                    }
                    path.skip();
                }
            }
        },
        undefined,
        opt_result
    );

    traverse.default(
        program_ast,
        {
            SequenceExpression: {
                exit(path: traverse.NodePath<types.SequenceExpression>, state) {
                    const replace_map = new Map<traverse.NodePath, types.Expression[]>();

                    for (let expression of path.get('expressions')) {
                        const assignment_paths: traverse.NodePath<types.AssignmentExpression>[] = [];
                        expression.traverse({
                            AssignmentExpression(path: traverse.NodePath<types.AssignmentExpression>) {
                                assignment_paths.push(path);
                            },
                            FunctionExpression(path: traverse.NodePath<types.FunctionExpression>) {
                                path.skip();
                            }
                        });
                        if (assignment_paths.length > 0) {
                            const assignment_exprs: types.AssignmentExpression[] = [];

                            const new_expression = hoistAssignmentExpression(expression, assignment_paths, assignment_exprs) as typeof expression.node;
                            assert.ok(assignment_exprs.length > 0);

                            if (types.isIdentifier(new_expression)) {
                                replace_map.set(expression, assignment_exprs);
                            } else {
                                replace_map.set(expression, [...assignment_exprs, new_expression]);
                            }
                        }
                    }

                    replace_map.forEach((new_expressions, expression) => expression.replaceInline(new_expressions));
                    state.count_in_seqexpr += replace_map.size;
                }
            }
        },
        undefined,
        opt_result
    );

    traverse.default(
        program_ast,
        {
            ExpressionStatement(path, state) {
                const _expression = path.get('expression');

                const assignment_paths: traverse.NodePath<types.AssignmentExpression>[] = [];
                path.traverse({
                    AssignmentExpression(path) {
                        if (path.node != _expression.node) {
                            assignment_paths.push(path);
                        }
                    },
                    ConditionalExpression(path) {
                        const _test = path.get('test');
                        if (_test.isAssignmentExpression()) {
                            assignment_paths.push(_test);
                        }

                        // @ts-ignore
                        _test.traverse(this, state);

                        path.skip();
                    },
                    LogicalExpression(path) {
                        const _left = path.get('left');
                        if (_left.isAssignmentExpression()) {
                            assignment_paths.push(_left);
                        }

                        // @ts-ignore
                        _left.traverse(this, state);

                        path.skip();
                    },
                    SequenceExpression(path) {
                        path.skip();
                    },
                    FunctionExpression(path) {
                        path.skip();
                    }
                });
                if (assignment_paths.length > 0) {
                    const assignment_exprs: types.AssignmentExpression[] = [];
                    const new_expression = hoistAssignmentExpression(path.get('expression'), assignment_paths, assignment_exprs) as typeof path.node;
                    assert.ok(assignment_exprs.length > 0);
                    //assert.ok(types.isCallExpression(new_expression));

                    assignment_exprs.forEach(e => path.insertBefore(types.expressionStatement(e)));
                    path.get('expression').replaceWith(new_expression);

                    ++state.count_in_others;
                }
            }
        },
        undefined,
        opt_result
    );

    // traverse.default(
    //     program_ast,
    //     {
    //         CallExpression(path: traverse.NodePath<types.CallExpression>, state) {
    //             if (path.parentPath.isExpressionStatement()) {
    //                 const assignment_paths: traverse.NodePath<types.AssignmentExpression>[] = [];
    //                 path.traverse({
    //                     AssignmentExpression(path: traverse.NodePath<types.AssignmentExpression>) {
    //                         assignment_paths.push(path);
    //                     },
    //                     ConditionalExpression(path: traverse.NodePath<types.ConditionalExpression>) {
    //                         path.get('consequent').skip();
    //                         path.get('alternate').skip();
    //                     },
    //                     FunctionExpression(path: traverse.NodePath<types.FunctionExpression>) {
    //                         path.skip();
    //                     }
    //                 });
    //                 if (assignment_paths.length > 0) {
    //                     const assignment_exprs: types.AssignmentExpression[] = [];
    //                     const new_expression = hoistAssignmentExpression(path, assignment_paths, assignment_exprs) as typeof path.node;
    //                     assert.ok(assignment_exprs.length > 0);
    //                     assert.ok(types.isCallExpression(new_expression));

    //                     assignment_exprs.forEach(e => path.parentPath.insertBefore(types.expressionStatement(e)));
    //                     path.replaceWith(new_expression);

    //                     ++state.count_in_callexpr;
    //                 }
    //             }
    //         }
    //     },
    //     undefined,
    //     opt_result
    // );

    // handle leftover assignment expressions
    // traverse.default(
    //     program_ast,
    //     {
    //         AssignmentExpression(path: traverse.NodePath<types.AssignmentExpression>, state) {
    //             if (path.parentPath.isSequenceExpression()) {
    //                 return;
    //             }

    //             if (path.parentPath.isExpressionStatement()) {
    //                 return;
    //             }

    //             if (path.parentPath.isConditionalExpression() && (path.node === path.parentPath.get('consequent').node || path.node === path.parentPath.get('alternate').node)) {
    //                 return;
    //             }

    //             let parent_path: traverse.NodePath = path.parentPath;
    //             let current_path: traverse.NodePath = path;

    //             while (true) {
    //                 if (parent_path.isConditionalExpression()) {
    //                     if (current_path.node !== parent_path.node.test) {
    //                         assert.ok(current_path.node === parent_path.node.consequent || current_path.node === parent_path.node.alternate);
    //                         break;
    //                     }
    //                 } else if (parent_path.isExpressionStatement()) {
    //                     break;
    //                 } else if (parent_path.isFunctionExpression()) {
    //                     break;
    //                 }
    //                 current_path = parent_path;
    //                 parent_path = current_path.parentPath!;
    //             }

    //             if (current_path.isAssignmentExpression() && parent_path.isConditionalExpression()) {
    //                 const assignment_paths: traverse.NodePath<types.AssignmentExpression>[] = [];
    //                 current_path.traverse({
    //                     AssignmentExpression(path: traverse.NodePath<types.AssignmentExpression>) {
    //                         assignment_paths.push(path);
    //                     },
    //                     FunctionExpression(path: traverse.NodePath<types.FunctionExpression>) {
    //                         path.skip();
    //                     }
    //                 });
    //                 assert.ok(assignment_paths.length > 0);

    //                 const assignment_exprs: types.AssignmentExpression[] = [];
    //                 const new_expression = hoistAssignmentExpression(current_path, assignment_paths, assignment_exprs) as typeof current_path.node;
    //                 assert.ok(assignment_exprs.length > 0);

    //                 current_path.replaceWith(types.sequenceExpression([...assignment_exprs, new_expression]));
    //             } else if (current_path.isAssignmentExpression() && parent_path.isExpressionStatement() || current_path.isCallExpression()) {
    //                 assert.ok(parent_path.isExpressionStatement());

    //                 const assignment_paths: traverse.NodePath<types.AssignmentExpression>[] = [];
    //                 current_path.traverse({
    //                     AssignmentExpression(path: traverse.NodePath<types.AssignmentExpression>) {
    //                         assignment_paths.push(path);
    //                     },
    //                     FunctionExpression(path: traverse.NodePath<types.FunctionExpression>) {
    //                         path.skip();
    //                     }
    //                 });
    //                 assert.ok(assignment_paths.length > 0);

    //                 const assignment_exprs: types.AssignmentExpression[] = [];
    //                 const new_expression = hoistAssignmentExpression(current_path, assignment_paths, assignment_exprs) as typeof current_path.node;
    //                 assert.ok(assignment_exprs.length > 0);

    //                 assignment_exprs.forEach(e => current_path.insertBefore(types.expressionStatement(e)));
    //                 current_path.replaceWith(new_expression);
    //             } else {
    //                 console.log(path.toString());
    //                 console.log(path.parentPath.toString());
    //                 throw new Error(`not implemented: ${current_path.type} under ${parent_path.type}: ${current_path}`);
    //             }

    //             path.skip();
    //         }
    //     },
    //     undefined,
    //     opt_result
    // );

    const parent_satistics = {
        sequence_expression: 0,
        expression_statement: 0,
        conditional_expression: 0,
        logical_expression: 0,
        other: 0
    };
    const unhandled_types = new Map<string, number>();
    traverse.default(
        program_ast,
        {
            AssignmentExpression(path: traverse.NodePath<types.AssignmentExpression>, state) {
                if (path.parentPath.isSequenceExpression()) {
                    ++parent_satistics.sequence_expression;
                } else if (path.parentPath.isExpressionStatement()) {
                    ++parent_satistics.expression_statement;
                } else if (path.parentPath.isConditionalExpression() && (path.node === path.parentPath.get('consequent').node || path.node === path.parentPath.get('alternate').node)) {
                    ++parent_satistics.conditional_expression;
                } else if (path.parentPath.isLogicalExpression() && path.node === path.parentPath.get('right').node) {
                    ++parent_satistics.logical_expression;
                } else {
                    ++parent_satistics.other;

                    let current_path: traverse.NodePath = path;
                    let parent_path: traverse.NodePath | null = current_path.parentPath;

                    while (parent_path != null) {
                        if (parent_path.isExpressionStatement()) {
                            const count = unhandled_types.get(current_path.type);
                            unhandled_types.set(current_path.type, count == null ? 1 : (count + 1));

                            //console.log(path.toString());
                            //console.log(path.parentPath.type, path.parentPath.toString());
                            //console.log(current_path.toString());

                            break;
                        } else {
                            current_path = parent_path;
                            parent_path = current_path.parentPath;
                        }
                    }
                }
            }
        },
        undefined,
        opt_result
    );

    console.log(parent_satistics);
    console.log(unhandled_types);
    console.log(`[*] optimized ${opt_result.count_in_vardecl} assignment expression(s) in VariableDeclaration`);
    console.log(`[*] optimized ${opt_result.count_in_seqexpr} assignment expression(s) in SequenceExpression`);
    console.log(`[*] optimized ${opt_result.count_in_others} assignment expression(s) in others`);
    fs.writeFileSync(args.OUTFILE, generator.default(program_ast).code);
}

if (require.main === module) {
    main();
}
