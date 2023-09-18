import * as assert from 'node:assert';
import * as fs from "node:fs";
import * as argparse from 'argparse';

import * as types from '@babel/types';
import * as parser from '@babel/parser';
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
    // check if `.join('')`
    if (isMemberExpressionCall(node, 'join') && node.arguments.length === 1 && types.isStringLiteral(node.arguments[0], { value: '' })) {
        // pass
    } else {
        return false;
    }

    // check if `.reverse()`
    if (isMemberExpressionCall(node.callee.object, 'reverse') && node.callee.object.arguments.length === 0) {
        // pass
    } else {
        return false;
    }

    // check if `.split('')`
    return isMemberExpressionCall(node.callee.object.callee.object, 'split')
        && node.callee.object.callee.object.arguments.length === 1
        && types.isStringLiteral(node.callee.object.callee.object.arguments[0], { value: '' });
}

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
                const _splitreversejoin_expressions = [];

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

                        if (!second_expression.isAssignmentExpression({ operator: '=' })) {
                            continue;
                        }

                        const second_left = second_expression.get('left');
                        const second_right = second_expression.get('right');
                        if (!second_left.isIdentifier({ name: first_left.node.name })) {
                            continue;
                        }
                        if (!isSplitReverseJoinCall(second_right.node)) {
                            continue;
                        }

                        // @ts-ignore
                        if (!types.isIdentifier(second_right.node.callee.object.callee.object.callee.object, { name: first_left.node.name })) {
                            continue;
                        }

                        _assign_expressions.push(first_expression);
                        _splitreversejoin_expressions.push(second_expression);
                        i = i + 1;
                    }
                }

                for (let i = 0; i < _assign_expressions.length; ++i) {
                    const sl = _assign_expressions[i].node.right as types.StringLiteral;
                    _assign_expressions[i].get('right').replaceWith(types.stringLiteral(sl.value.split('').reverse().join('')));
                    _splitreversejoin_expressions[i].remove();
                }

                state.count += _assign_expressions.length;
            }
        },
        undefined,
        opt_result
    );

    console.log(`[*] optimized ${opt_result.count} assign-split_reverse_join pair(s)`);
    fs.writeFileSync(args.OUTFILE, generator.default(program_ast).code);
}

if (require.main === module) {
    main();
}
