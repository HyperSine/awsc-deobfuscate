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
                if (path.parentPath.isExpressionStatement()) {
                    path.replaceWithMultiple(path.get('expressions').map(p => types.expressionStatement(p.node)));
                    ++state.count;
                } else if (path.parentPath.isLogicalExpression()) {
                    if (path.node === path.parentPath.get('left').node) {
                        throw new Error('not implemented');
                    } else {
                        console.log(`[*] line: ${path.parentPath.node.loc?.start.line}: skip the SequenceExpression in LogicalExpression`);
                    }
                } else if (path.parentPath.isIfStatement()) {
                    if (path.node === path.parentPath.get('test').node) {
                        const expressions = path.get('expressions').map(p => types.cloneDeepWithoutLoc(p.node));
                        assert.ok(expressions.length >= 1);

                        path.parentPath.get('test').replaceWith(expressions.at(-1)!);
                        path.parentPath.insertBefore(expressions.slice(0, -1).map(n => types.expressionStatement(n)));
                        ++state.count;
                    } else {
                        console.log(`[*] line: ${path.parentPath.node.loc?.start.line}: skip the SequenceExpression in IfStatement`);
                    }
                } else if (path.parentPath.isForStatement()) {
                    console.log(`[*] line: ${path.parentPath.node.loc?.start.line}: skip the SequenceExpression in ForStatement`);
                } else if (path.parentPath.isReturnStatement()) {
                    assert.ok(path.node === path.parentPath.get('argument').node);

                    const expressions = path.get('expressions').map(p => types.cloneDeepWithoutLoc(p.node));
                    assert.ok(expressions.length >= 1);

                    path.parentPath.get('argument').replaceWith(expressions.at(-1)!);
                    path.parentPath.insertBefore(expressions.slice(0, -1).map(n => types.expressionStatement(n)));
                    ++state.count;
                } else {
                    throw new Error(`not implemented, line ${path.parentPath.node.loc?.start.line}: a SequenceExpression in ${path.parentPath.type}`);
                }
            }
        },
        undefined,
        opt_result
    );

    console.log(`[*] optimized ${opt_result.count}`);
    fs.writeFileSync(args.OUTFILE, generator.default(program_ast).code);
}

if (require.main === module) {
    main();
}
