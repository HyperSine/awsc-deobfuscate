import * as assert from 'node:assert';
import * as readline from 'node:readline';

import * as deasync from 'deasync';
import * as argparse from 'argparse';

import * as types from '@babel/types';
import * as traverse from '@babel/traverse';
import * as generator from '@babel/generator';

import * as z3js from './z3js';
import * as parser from "@babel/parser";
import fs from "node:fs";

const Z3Context = new z3js.Context();

export class DeflatGraph {
    for_statement: traverse.NodePath<types.ForStatement>;
    derived_keys_statement: traverse.NodePath<types.VariableDeclaration>;
    switch_statement: traverse.NodePath<types.SwitchStatement>;

    read_xrefs_cache: Map<traverse.Node, traverse.NodePath[]>;
    write_xrefs_cache: Map<traverse.Node, traverse.NodePath[]>;

    deflat_blocks: DeflatBlock[];
    deflat_block_preds: Map<DeflatBlock, DeflatBlock[]>;
    deflat_block_succs: Map<DeflatBlock, DeflatBlock[]>;

    constructor(path: traverse.NodePath<types.ForStatement>) {
        assert.ok(path.isForStatement());

        const for_update = path.get('update');
        assert.ok(for_update.hasNode() === false);

        const for_body = path.get('body');
        assert.ok(for_body.isBlockStatement());

        const for_body_body = for_body.get('body');
        assert.ok(for_body_body.length === 2);
        assert.ok(for_body_body[0].isVariableDeclaration());
        assert.ok(for_body_body[1].isSwitchStatement());

        this.for_statement = path;
        this.derived_keys_statement = for_body_body[0];
        this.switch_statement = for_body_body[1];

        this.read_xrefs_cache = new Map();
        this.write_xrefs_cache = new Map();

        this.deflat_blocks = []
        this.deflat_block_preds = new Map();
        this.deflat_block_succs = new Map();
    }

    indexOf(block: DeflatBlock): number {
        return this.deflat_blocks.indexOf(block);
    }

    getPredecessors(block: DeflatBlock): DeflatBlock[] {
        const pred_blocks = this.deflat_block_preds.get(block);
        return pred_blocks == null ? [] : pred_blocks;
    }

    getPredecessorsNum(block: DeflatBlock): number {
        const pred_blocks = this.deflat_block_preds.get(block);
        return pred_blocks == null ? 0 : pred_blocks.length;
    }

    getSuccessors(block: DeflatBlock): DeflatBlock[] {
        const succ_blocks = this.deflat_block_succs.get(block);
        return succ_blocks == null ? [] : succ_blocks;
    }

    getSuccessorsNum(block: DeflatBlock): number {
        const succ_blocks = this.deflat_block_succs.get(block);
        return succ_blocks == null ? 0 : succ_blocks.length;
    }

    build(block?: DeflatBlock): DeflatBlock {
        if (block === undefined) {
            this.deflat_blocks.splice(0, this.deflat_blocks.length);
            this.deflat_block_preds.clear();
            this.deflat_block_succs.clear();

            let epilogue_block = new DeflatBlock(this);
            this.deflat_blocks.push(epilogue_block);

            let prologue_block = new DeflatBlock(this);
            {
                const for_init = this.for_statement.get('init');
                assert.ok(for_init.hasNode());

                prologue_block.updateFlatState(for_init);
            }

            return this.build(prologue_block);
        } else {
            const for_cond_expression = this.for_statement.get('test');
            assert.ok(for_cond_expression.hasNode());
            if (block.expectEvaluate(for_cond_expression)) {
                block.updateFlatState(this.derived_keys_statement);
                block.walk(this.switch_statement);

                for (let b of this.deflat_blocks.slice(1)) {
                    if (b.isEquivalentTo(block)) {
                        return b;
                    }
                }

                this.deflat_blocks.push(block);

                if (block.flat_jumpout_path == null && block.fork_path != null) {
                    let true_block = new DeflatBlock(this);
                    let false_block = new DeflatBlock(this);

                    true_block.cloneFlatState(block.fork_true_state!);
                    false_block.cloneFlatState(block.fork_false_state!)

                    true_block = this.build(true_block);
                    false_block = this.build(false_block);

                    this.deflat_block_succs.set(block, [true_block, false_block]);

                    if (this.deflat_block_preds.has(true_block)) {
                        this.deflat_block_preds.get(true_block)!.push(block);
                    } else {
                        this.deflat_block_preds.set(true_block, [block]);
                    }

                    if (this.deflat_block_preds.has(false_block)) {
                        this.deflat_block_preds.get(false_block)!.push(block);
                    } else {
                        this.deflat_block_preds.set(false_block, [block]);
                    }
                } else if (block.flat_jumpout_path != null && block.fork_path == null) {
                    assert.ok(block.flat_jumpout_path === this.for_statement || block.flat_jumpout_path.isAncestor(this.for_statement));
                } else {
                    assert.ok(block.flat_jumpout_path == null && block.fork_path == null);

                    let next_block = new DeflatBlock(this);
                    next_block.cloneFlatState(block.flat_state);

                    next_block = this.build(next_block);

                    this.deflat_block_succs.set(block, [next_block]);

                    if (this.deflat_block_preds.has(next_block)) {
                        this.deflat_block_preds.get(next_block)!.push(block);
                    } else {
                        this.deflat_block_preds.set(next_block, [block]);
                    }
                }

                return block
            } else {
                return this.deflat_blocks[0];
            }
        }
    }

    optimizeBogusFork(): number {
        let tracked_blocks = new Set<DeflatBlock>();

        function traverse_graph(graph: DeflatGraph, start_block: DeflatBlock): number {
            let count = 0;
            for (let current_block = start_block; !tracked_blocks.has(current_block);) {
                tracked_blocks.add(current_block);

                let succ_blocks = graph.getSuccessors(current_block);
                if (succ_blocks.length === 0) {
                    break;
                } else if (succ_blocks.length === 1) {
                    current_block = succ_blocks[0];
                } else {
                    assert.ok(succ_blocks.length === 2);
                    assert.ok(current_block.fork_path != null);

                    console.log(graph.deflat_blocks.indexOf(current_block));

                    let res;
                    {
                        let analyser = new InequalityPredicateAnalyser(current_block);
                        res = analyser.analyse();
                    }
                    deasync.runLoopOnce();

                    console.log(res, current_block.fork_path.toString());
                    readline.moveCursor(process.stdout, 0, -2);
                    readline.clearScreenDown(process.stdout);

                    if (res.confident) {
                        const unreachable_succ_block = succ_blocks[res.value ? 1 : 0];
                        const unreachable_succ_pred_blocks = graph.deflat_block_preds.get(unreachable_succ_block)!;

                        succ_blocks.splice(res.value ? 1 : 0, 1);

                        if (unreachable_succ_pred_blocks.length == 1) {
                            assert.ok(unreachable_succ_pred_blocks[0] === current_block);
                            graph.deflat_block_preds.delete(unreachable_succ_block);
                        } else {
                            const index_to_remove = unreachable_succ_pred_blocks.indexOf(current_block);
                            assert.ok(index_to_remove >= 0);
                            unreachable_succ_pred_blocks.splice(index_to_remove, 1);
                        }

                        count += traverse_graph(graph, succ_blocks[0]) + 1;
                    } else {
                        count += traverse_graph(graph, succ_blocks[0]);
                        count += traverse_graph(graph, succ_blocks[1]);
                    }

                    break;
                }
            }
            return count;
        }

        return traverse_graph(this, this.deflat_blocks[1]);
    }

    optimizeUnreachableBlock(): number {
        let count = 0;
        for (let i = 2; i < this.deflat_blocks.length; ++i) {
            const current_block = this.deflat_blocks[i];
            if (!this.deflat_block_preds.has(current_block) && this.deflat_block_succs.has(current_block)) {
                const succ_blocks = this.deflat_block_succs.get(current_block)!;
                for (let succ_block of succ_blocks) {
                    const succ_pred_blocks = this.deflat_block_preds.get(succ_block)!;
                    if (succ_pred_blocks.length === 1) {
                        assert.ok(succ_pred_blocks[0] === current_block);
                        this.deflat_block_preds.delete(succ_block)
                    } else {
                        const index_to_remove = succ_pred_blocks.indexOf(current_block);
                        assert.ok(index_to_remove >= 0);
                        succ_pred_blocks.splice(index_to_remove, 1);
                    }
                }
                this.deflat_block_succs.delete(current_block);
                ++count;
            }
        }
        return count;
    }

    optimizeEmptyBlock(): number {
        let count = 0;
        for (let i = 2; i < this.deflat_blocks.length; ++i) {
            const current_block = this.deflat_blocks[i];
            if (current_block.paths.length === 0 && current_block.fork_path == null) {
                assert.ok(this.deflat_block_succs.has(current_block));

                const pred_blocks = this.getPredecessors(current_block);
                const succ_blocks = this.deflat_block_succs.get(current_block)!;
                assert.ok(succ_blocks.length === 1);

                const succ_pred_blocks = this.deflat_block_preds.get(succ_blocks[0])!;
                assert.ok(succ_pred_blocks.length > 0);

                // unlink `current_block -> succ_blocks[0]`
                {
                    const index_to_remove = succ_pred_blocks.indexOf(current_block);
                    assert.ok(index_to_remove >= 0);

                    succ_pred_blocks.splice(index_to_remove, 1);
                    this.deflat_block_succs.delete(current_block);
                }

                // link `pred_blocks -> succ_blocks[0]`
                for (const pred_block of pred_blocks) {
                    const pred_succ_blocks = this.deflat_block_succs.get(pred_block)!;
                    assert.ok(pred_succ_blocks.length > 0);

                    const index_to_replace = pred_succ_blocks.indexOf(current_block);
                    assert.ok(index_to_replace >= 0);

                    pred_succ_blocks[index_to_replace] = succ_blocks[0];

                    assert.ok(succ_pred_blocks.indexOf(pred_block) < 0);
                    succ_pred_blocks.push(pred_block);
                }

                ++count;
            }
        }
        return count;
    }

    generateAst(): traverse.Node[] {
        const rec = new CfgRecovery(this).build();
        return rec.root!.generateAst([]);
    }
}

export class DeflatBlock {
    graph: WeakRef<DeflatGraph>;

    flat_state: Map<string, any>;
    flat_switching_state?: Map<string, any>;
    flat_jumpout_path?: traverse.NodePath;

    paths: traverse.NodePath<types.Expression | types.Statement>[];

    fork_path?: traverse.NodePath<types.Expression>;
    fork_true_state?: Map<string, any>;
    fork_false_state?: Map<string, any>;

    constructor(graph: DeflatGraph) {
        this.graph = new WeakRef(graph);
        this.flat_state = new Map();
        this.paths = [];
    }

    getGraph(): DeflatGraph {
        return this.graph.deref()!;
    }

    isEquivalentTo(other: DeflatBlock): boolean {
        assert.ok(this.flat_switching_state != null);
        assert.ok(other.flat_switching_state != null);

        for (const [k, v] of this.flat_switching_state.entries()) {
            if (!other.flat_switching_state.has(k)) {
                return false;
            }
            if (v !== other.flat_switching_state.get(k)) {
                return false;
            }
        }

        return true;
    }

    setFlatState(source: Record<string, any>): void {
        Object.entries(source).forEach(([k, v]) => this.flat_state.set(k, v));
    }

    cloneFlatState(source: Map<string, any>): void {
        source.forEach((v, k) => this.flat_state.set(k, v));
    }

    updateFlatState(path: traverse.NodePath): void {
        if (path.isVariableDeclaration({ kind: 'var' })) {
            for (let declaration of path.get('declarations')) {
                let id = declaration.get('id');
                let init = declaration.get('init');

                assert.ok(id.isIdentifier());

                if (init.hasNode()) {
                    this.flat_state.set(id.node.name, this.expectEvaluate(init));
                } else {
                    if (this.flat_state.has(id.node.name)) {
                        // pass
                    } else {
                        this.flat_state.set(id.node.name, undefined);
                    }
                }
            }
        } else {
            throw Error(`Not implemented: ${path}`);
        }
    }

    getFlatStateReadXref(path: traverse.NodePath): traverse.NodePath[] {
        const read_xrefs_cache = this.getGraph().read_xrefs_cache;
        if (read_xrefs_cache.has(path.node)) {
            return read_xrefs_cache.get(path.node)!;
        } else {
            let refs: traverse.NodePath[] = [];

            for (const name of this.flat_state.keys()) {
                const binding = this.getGraph().for_statement.scope.getBinding(name)!;
                refs = refs.concat(binding.referencePaths.filter(r => r.node === path.node || r.isDescendant(path)));
            }

            read_xrefs_cache.set(path.node, refs);
            return refs;
        }
    }

    getFlatStateWriteXref(path: traverse.NodePath): traverse.NodePath[] {
        const write_xrefs_cache = this.getGraph().write_xrefs_cache;
        if (write_xrefs_cache.has(path.node)) {
            return write_xrefs_cache.get(path.node)!;
        } else {
            let refs: traverse.NodePath[] = [];

            for (const name of this.flat_state.keys()) {
                const binding = this.getGraph().for_statement.scope.getBinding(name)!;
                refs = refs.concat(binding.constantViolations.filter(cv => cv.node === path.node || cv.isDescendant(path)));
            }

            write_xrefs_cache.set(path.node, refs);
            return refs;
        }
    }

    tryEvaluate(path: traverse.NodePath): { confident: boolean, value?: any } {
        if (path.isNullLiteral()) {
            return { confident: true, value: null };
        } else if (path.isBooleanLiteral() || path.isNumericLiteral() || path.isStringLiteral()) {
            return { confident: true, value: path.node.value };
        } else if (path.isIdentifier()) {
            if (this.flat_state.has(path.node.name)) {
                return { confident: true, value: this.flat_state.get(path.node.name) };
            } else {
                return { confident: false };
            }
        } else if (path.isAssignmentExpression()) {
            return { confident: false };
        } else if (path.isUnaryExpression()) {
            let { operator } = path.node;
            let argument = this.tryEvaluate(path.get('argument'));

            if (!argument.confident) {
                return { confident: false };
            }

            switch (operator) {
                case 'void':
                    return { confident: true, value: void argument.value };
                default:
                    throw Error(`Unhandled operator: ${operator}`);
            }
        } else if (path.isBinaryExpression()) {
            let { operator } = path.node;

            let left_eval = this.tryEvaluate(path.get('left'));
            let right_eval = this.tryEvaluate(path.get('right'));

            if (!left_eval.confident || !right_eval.confident) {
                return { confident: false };
            }

            switch (operator) {
                case '==':
                    return { confident: true, value: left_eval.value == right_eval.value };
                case '!=':
                    return { confident: true, value: left_eval.value != right_eval.value };
                case '===':
                    return { confident: true, value: left_eval.value === right_eval.value };
                case '!==':
                    return { confident: true, value: left_eval.value !== right_eval.value };
                case '<':
                    return { confident: true, value: left_eval.value < right_eval.value };
                case '<=':
                    return { confident: true, value: left_eval.value <= right_eval.value };
                case '>':
                    return { confident: true, value: left_eval.value > right_eval.value };
                case '>=':
                    return { confident: true, value: left_eval.value >= right_eval.value };
                case '+':
                    return { confident: true, value: left_eval.value + right_eval.value };
                case '-':
                    return { confident: true, value: left_eval.value - right_eval.value };
                case '*':
                    return { confident: true, value: left_eval.value * right_eval.value };
                case '/':
                    return { confident: true, value: left_eval.value / right_eval.value };
                case '%':
                    return { confident: true, value: left_eval.value % right_eval.value };
                case '&':
                    return { confident: true, value: left_eval.value & right_eval.value };
                case '|':
                    return { confident: true, value: left_eval.value | right_eval.value };
                case '^':
                    return { confident: true, value: left_eval.value ^ right_eval.value };
                case '<<':
                    return { confident: true, value: left_eval.value << right_eval.value };
                case '>>':
                    return { confident: true, value: left_eval.value >> right_eval.value };
                default:
                    throw Error(`Unhandled operator: ${operator}`);
            }
        } else if (path.isLogicalExpression()) {
            let { operator } = path.node;

            let left_eval = this.tryEvaluate(path.get('left'));
            let right_eval = this.tryEvaluate(path.get('right'));

            if (!left_eval.confident || !right_eval.confident) {
                return { confident: false };
            }

            switch (operator) {
                case '&&':
                    return { confident: true, value: left_eval.value && right_eval.value };
                case '||':
                    return { confident: true, value: left_eval.value || right_eval.value };
                default:
                    throw Error(`Unhandled operator: ${operator}`);
            }
        } else if (path.isMemberExpression()) {
            let object_eval= this.tryEvaluate(path.get('object'));
            if (object_eval.confident) {
                throw Error(`Unhandled MemberExpression: ${path}`);
            } else {
                return { confident: false };
            }
        } else {
            throw Error(`Unhandled AST: ${path}`);
        }
    }

    expectEvaluate(path: traverse.NodePath): any {
        let { confident, value } = this.tryEvaluate(path);
        if (confident === true) {
            return value;
        } else {
            throw new Error(`Unable to evaluate: ${path}`);
        }
    }

    pushPath(path: traverse.NodePath<types.Expression | types.Statement>) {
        assert.ok(this.fork_path == null);
        this.paths.push(path);
    }

    walkExpression(path: traverse.NodePath<types.Expression>) {
        if (path.isAssignmentExpression()) {
            const left = path.get('left');
            const right = path.get('right');

            if (left.isIdentifier() && this.flat_state.has(left.node.name)) {
                if (right.isLiteral() || right.isUnaryExpression({ operator: 'void' }) && right.get('argument').isLiteral()) {
                    this.flat_state.set(left.node.name, this.expectEvaluate(right));
                    return;
                }

                if (right.isConditionalExpression()) {
                    let unwrapped_expression: traverse.NodePath<types.Expression> = right;

                    do {
                        const conditional_expression = unwrapped_expression as traverse.NodePath<types.ConditionalExpression>;
                        const { confident, value } = this.tryEvaluate(conditional_expression.get('test'));
                        if (confident) {
                            unwrapped_expression = value ? conditional_expression.get('consequent') : conditional_expression.get('alternate');
                        } else {
                            break;
                        }
                    } while (unwrapped_expression.isConditionalExpression());

                    if (unwrapped_expression.isLiteral()) {
                        this.flat_state.set(left.node.name, this.expectEvaluate(unwrapped_expression));
                        return;
                    } else if (unwrapped_expression.isConditionalExpression() && unwrapped_expression.get('consequent').isLiteral() && unwrapped_expression.get('alternate').isLiteral()) {
                        assert.ok(this.fork_path == null);
                        assert.ok(this.fork_true_state == null);
                        assert.ok(this.fork_false_state == null);

                        this.fork_path = unwrapped_expression.get('test');
                        this.fork_true_state = new Map(this.flat_state);
                        this.fork_false_state = new Map(this.flat_state);

                        this.fork_true_state.set(left.node.name, this.expectEvaluate(unwrapped_expression.get('consequent')));
                        this.fork_false_state.set(left.node.name, this.expectEvaluate(unwrapped_expression.get('alternate')));

                        return;
                    }
                }
            }

            throw Error(`Unhandled AssignmentExpression: ${path}`);
        } else if (path.isConditionalExpression()) {
            let { confident, value } = this.tryEvaluate(path.get('test'));
            if (confident) {
                this.walkExpression(value ? path.get('consequent') : path.get('alternate'));
            } else {
                this.pushPath(path);
            }
        } else if (path.isUnaryExpression()) {
            if (path.node.operator === 'void') {
                if (path.get('argument').isAssignmentExpression()) {
                    this.walkExpression(path.get('argument'));
                    return;
                }
                if (path.get('argument').isConditionalExpression()) {
                    this.walkExpression(path.get('argument'));
                    return;
                }
            }

            if (path.node.operator === '!' && path.get('argument').isCallExpression()) {
                this.walkExpression(path.get('argument'));
                return;
            }

            throw Error(`Unhandled UnaryExpression: ${path}`);
        } else if (path.isLogicalExpression()) {
            let left = path.get('left');
            let right = path.get('right');

            let left_eval = this.tryEvaluate(left);
            if (left_eval.confident) {
                switch (path.node.operator) {
                    case '&&':
                        if (left_eval.value) {
                            this.walkExpression(right);
                        } else {
                            // ignore right
                        }
                        break;
                    case '||':
                        if (left_eval.value) {
                            // ignore right
                        } else {
                            this.walkExpression(right);
                        }
                        break;
                    default:
                        throw Error(`Unhandled operator: ${path.node.operator}`);
                }
                return;
            }

            throw Error(`Unhandled LogicalExpression: ${path}`);
        } else if (path.isSequenceExpression()) {
            const read_xrefs = this.getFlatStateReadXref(path);
            const write_xrefs = this.getFlatStateWriteXref(path);

            for (let expression of path.get('expressions')) {
                if (write_xrefs.some(xref => xref.node === expression.node || xref.isDescendant(expression)) || read_xrefs.some(xref => xref.node === expression.node || xref.isDescendant(expression))) {
                    this.walkExpression(expression);
                } else {
                    this.pushPath(expression);
                }
            }
        } else if (path.isCallExpression()) {
            const callee = path.get('callee');

            if (callee.isFunctionExpression({ id: null, generator: false, async: false }) && callee.get('params').length === 0 && path.get('arguments').length === 0) {
                for (let statement of callee.get('body').get('body')) {
                    this.walkStatement(statement);
                    if (this.flat_jumpout_path != null) {
                        assert.ok(this.flat_jumpout_path === callee || this.flat_jumpout_path.isAncestor(callee));
                        if (this.flat_jumpout_path === callee) {
                            delete this.flat_jumpout_path;
                        }
                        break;
                    }
                }
                return;
            }

            throw Error(`Unhandled CallExpression: ${path}`);
        } else {
            throw Error(`Unhandled expression: ${path}`);
        }
    }

    walkStatement(path: traverse.NodePath<types.Statement>) {
        if (path.isExpressionStatement()) {
            this.walkExpression(path.get('expression'));
        } else if (path.isSwitchStatement()) {
            let case_num = this.expectEvaluate(path.get('discriminant'));
            let case_paths = path.get('cases').filter(c => c.get('test').isNumericLiteral({ value: case_num }));
            assert.ok(case_paths.length === 1);

            const read_xrefs = this.getFlatStateReadXref(case_paths[0]);
            const write_xrefs = this.getFlatStateWriteXref(case_paths[0]);

            for (let statement of case_paths[0].get('consequent')) {
                assert.ok(statement.isStatement());

                if (write_xrefs.some(xref => xref.node === statement.node || xref.isDescendant(statement)) || read_xrefs.some(xref => xref.node === statement.node || xref.isDescendant(statement))) {
                    this.walkStatement(statement);
                } else {
                    if (statement.isAwaitExpression()) {
                        throw Error(`Unhandled AwaitExpression: ${statement}`);
                    } else if (statement.isBreakStatement({ label: null })) {
                        assert.ok(this.flat_jumpout_path == null);
                        this.flat_jumpout_path = path;
                    } else if (statement.isContinueStatement({ label: null })) {
                        assert.ok(this.flat_jumpout_path == null);
                        this.flat_jumpout_path = path.findParent(p => p.isForStatement())!;
                        assert.ok(this.flat_jumpout_path != null);
                    } else if (statement.isReturnStatement()) {
                        this.pushPath(statement);

                        assert.ok(this.flat_jumpout_path == null);
                        this.flat_jumpout_path = path.findParent(p => p.isFunctionExpression())!;
                        assert.ok(this.flat_jumpout_path != null);
                    } else if (statement.isThrowStatement()) {
                        throw Error(`Unhandled ThrowStatement: ${statement}`);
                    } else if (statement.isYieldExpression()) {
                        throw Error(`Unhandled YieldExpression: ${statement}`);
                    } else {
                        this.pushPath(statement);
                    }
                }

                if (this.flat_jumpout_path != null) {
                    assert.ok(this.flat_jumpout_path === path || this.flat_jumpout_path.isAncestor(path));
                    if (this.flat_jumpout_path === path) {
                        delete this.flat_jumpout_path;
                    }
                    break;
                }
            }
        } else if (path.isIfStatement()) {
            let { confident, value } = this.tryEvaluate(path.get('test'));
            if (confident) {
                const alternate = path.get('alternate');
                assert.ok(alternate.hasNode());

                this.walkStatement(value ? path.get('consequent') : alternate);
            } else {
                throw Error(`Unhandled IfStatement: ${path}`);
            }
        } else if (path.isBlockStatement()) {
            const read_xrefs = this.getFlatStateReadXref(path);
            const write_xrefs = this.getFlatStateWriteXref(path);

            for (let statement of path.get('body')) {
                assert.ok(statement.isStatement());
                if (write_xrefs.some(xref => xref.node === statement.node || xref.isDescendant(statement)) || read_xrefs.some(xref => xref.node === statement.node || xref.isDescendant(statement))) {
                    this.walkStatement(statement);
                } else {
                    if (statement.isAwaitExpression()) {
                        throw Error(`Unhandled AwaitExpression: ${statement}`);
                    } else if (statement.isBreakStatement({ label: null })) {
                        assert.ok(this.flat_jumpout_path === null);

                        let for_statement = path.findParent(p => p.isForStatement());
                        let switch_statement = path.findParent(p => p.isForStatement());

                        if (for_statement != null && switch_statement == null) {
                            this.flat_jumpout_path = for_statement;
                        } else if (for_statement == null && switch_statement != null) {
                            this.flat_jumpout_path = switch_statement;
                        } else {
                            assert.ok(for_statement != null && switch_statement != null);
                            this.flat_jumpout_path = for_statement.isDescendant(switch_statement) ? for_statement : switch_statement;
                        }
                    } else if(statement.isContinueStatement({ label: null })) {
                        assert.ok(this.flat_jumpout_path == null);
                        this.flat_jumpout_path = path.findParent(p => p.isForStatement())!;
                        assert.ok(this.flat_jumpout_path != null);
                    } else if (statement.isReturnStatement()) {
                        this.pushPath(statement);

                        assert.ok(this.flat_jumpout_path == null);
                        this.flat_jumpout_path = path.findParent(p => p.isFunctionExpression())!;
                        assert.ok(this.flat_jumpout_path != null);
                    } else if (statement.isThrowStatement()) {
                        throw Error(`Unhandled ThrowStatement: ${statement}`);
                    } else if (statement.isYieldExpression()) {
                        throw Error(`Unhandled YieldExpression: ${statement}`);
                    } else {
                        this.pushPath(statement);
                    }
                }

                if (this.flat_jumpout_path != null) {
                    assert.ok(this.flat_jumpout_path !== path || this.flat_jumpout_path.isAncestor(path));
                    break;
                }
            }
        } else {
            throw Error(`Unhandled statement: ${path}`);
        }
    }

    walk(path: traverse.NodePath<types.SwitchStatement>) {
        assert.ok(this.flat_switching_state == null);
        this.flat_switching_state = new Map(this.flat_state);
        this.walkStatement(path);
    }
}

class DeflatEdgeSet {
    edges: Map<DeflatBlock, Set<DeflatBlock>>;

    constructor() {
        this.edges = new Map();
    }

    addEdge(u: DeflatBlock, v: DeflatBlock): void {
        const succ_blocks = this.edges.get(u);
        if (succ_blocks != null) {
            succ_blocks.add(v);
        } else {
            this.edges.set(u, new Set([v]));
        }
    }

    hasEdge(u: DeflatBlock, v: DeflatBlock): boolean {
        const succ_blocks = this.edges.get(u);
        return succ_blocks != null && succ_blocks.has(v);
    }

    removeEdge(u: DeflatBlock, v: DeflatBlock): boolean {
        const succ_blocks = this.edges.get(u);
        if (succ_blocks == null) {
            return false;
        }

        if (succ_blocks.delete(v)) {
            return false;
        }

        return succ_blocks.size === 0 ? this.edges.delete(u) : true;
    }
}

type CfgElement =
    CfgSequential | CfgIfStructure | CfgIfEscapeStructure | CfgLoopStructure | CfgContinueStructure | CfgBreakStructure;

class CfgSequential {
    sequence: (DeflatBlock | CfgElement)[];

    constructor(sequence: (DeflatBlock | CfgElement)[]) {
        this.sequence = sequence;
    }

    generateAst(contexts: CfgElement[]): types.Statement[] {
        let ast: types.Statement[] = [];

        for (let elem of this.sequence) {
            if (elem instanceof DeflatBlock) {
                ast.push(...CfgSequential.generateAstFromPaths(elem.paths));
                if (elem.fork_path != null) {
                    const statement = types.expressionStatement(types.cloneDeepWithoutLoc(elem.fork_path.node));
                    types.addComment(statement, 'leading', 'bogus condition expression');
                    ast.push(statement);
                }
            } else if (elem instanceof CfgIfStructure) {
                contexts.push(this);
                ast.push(...elem.generateAst(contexts));
                contexts.pop();
            } else if (elem instanceof CfgIfEscapeStructure) {
                contexts.push(this);
                ast.push(...elem.generateAst(contexts));
                contexts.push(this);
            } else if (elem instanceof CfgLoopStructure) {
                contexts.push(this);
                ast.push(elem.generateAst(contexts));
                contexts.push(this);
            } else if (elem instanceof CfgContinueStructure) {
                contexts.push(this);
                ast.push(elem.generateAst(contexts));
                contexts.push(this);
            } else if (elem instanceof CfgBreakStructure) {
                contexts.push(this);
                ast.push(elem.generateAst(contexts));
                contexts.push(this);
            } else {
                throw Error('not implemented yet.');
            }
        }

        return ast;
    }

    static generateAstFromPaths(paths: traverse.NodePath<types.Expression | types.Statement>[]): types.Statement[] {
        const ast: types.Statement[] = [];
        for (let path of paths) {
            if (path.isExpression()) {
                ast.push(types.expressionStatement(types.cloneDeepWithoutLoc(path.node)));
            } else if (path.isStatement()) {
                ast.push(types.cloneDeepWithoutLoc(path.node));
            } else {
                throw new Error(`not implemented: ${path}`);
            }
        }
        return ast;
    }
}

class CfgIfStructure {
    nodes: Set<DeflatBlock>;
    cond_node: DeflatBlock;
    converge_node: DeflatBlock;
    true_body?: CfgSequential;
    false_body?: CfgSequential;

    constructor(nodes: Set<DeflatBlock>, cond_node: DeflatBlock, converge_node: DeflatBlock, true_body?: CfgSequential, false_body?: CfgSequential) {
        if (true_body == null && false_body == null) {
            throw new Error('neither true nor false branch is empty.');
        }
        this.nodes = nodes;
        this.cond_node = cond_node;
        this.converge_node = converge_node;
        this.true_body = true_body;
        this.false_body = false_body;
    }

    entry(): DeflatBlock {
        return this.cond_node;
    }

    exit(): DeflatBlock {
        return this.converge_node;
    }

    generateAst(contexts: CfgElement[]): types.Statement[] {
        const ast: types.Statement[] = CfgSequential.generateAstFromPaths(this.cond_node.paths);

        assert.ok(this.cond_node.fork_path != null);
        const cond_ast = types.cloneDeepWithoutLoc(this.cond_node.fork_path.node);

        if (this.true_body != null && this.false_body == null) {
            contexts.push(this);
            const true_ast = types.blockStatement(this.true_body.generateAst(contexts));
            contexts.pop();

            ast.push(types.ifStatement(cond_ast, true_ast));
        } else if (this.true_body == null && this.false_body != null) {
            contexts.push(this);
            const false_ast = types.blockStatement(this.false_body.generateAst(contexts));
            contexts.pop();

            ast.push(types.ifStatement(types.unaryExpression('!', cond_ast), false_ast));
        } else {
            assert.ok(this.true_body != null);
            assert.ok(this.false_body != null);

            contexts.push(this);
            const true_ast = types.blockStatement(this.true_body.generateAst(contexts));
            const false_ast = types.blockStatement(this.false_body.generateAst(contexts));
            contexts.pop();

            ast.push(types.ifStatement(cond_ast, true_ast, false_ast));
        }

        return ast;
    }
}

class CfgIfEscapeStructure {
    nodes: Set<DeflatBlock>;
    cond_node: DeflatBlock;
    escape_cond: boolean;
    true_node: DeflatBlock;
    false_node: DeflatBlock;
    body: CfgSequential;

    constructor(nodes: Set<DeflatBlock>, cond_node: DeflatBlock, escape_cond: boolean, true_node: DeflatBlock, false_node: DeflatBlock, body: CfgSequential) {
        this.nodes = nodes;
        this.cond_node = cond_node;
        this.escape_cond = escape_cond;
        this.true_node = true_node;
        this.false_node = false_node;
        this.body = body;
    }

    entry(): DeflatBlock {
        return this.cond_node;
    }

    exit(): DeflatBlock {
        return this.escape_cond ? this.false_node : this.true_node;
    }

    generateAst(contexts: CfgElement[]): types.Statement[] {
        assert.ok(this.cond_node.fork_path != null);
        const ast: types.Statement[] = CfgSequential.generateAstFromPaths(this.cond_node.paths);

        contexts.push(this);
        const cond_ast = types.cloneDeepWithoutLoc(this.cond_node.fork_path.node)
        const body_ast = types.blockStatement(this.body.generateAst(contexts));
        contexts.pop();

        ast.push(types.ifStatement(this.escape_cond ? cond_ast : types.unaryExpression('!', cond_ast), body_ast));
        return ast;
    }
}

class CfgLoopStructure {
    nodes: Set<DeflatBlock>;
    loopin_node: DeflatBlock;
    loopout_nodes: Set<DeflatBlock>;
    continue_node: DeflatBlock;
    break_node: DeflatBlock;
    label?: string;
    body: CfgSequential;

    constructor(nodes: Set<DeflatBlock>, loopin_node: DeflatBlock, loopout_nodes: Set<DeflatBlock>, continue_node: DeflatBlock, break_node: DeflatBlock, body: CfgSequential) {
        this.nodes = nodes
        this.loopin_node = loopin_node
        this.loopout_nodes = loopout_nodes
        this.continue_node = continue_node
        this.break_node = break_node
        this.body = body
    }

    entry(): DeflatBlock {
        return this.loopin_node;
    }

    exit(): DeflatBlock {
        return this.break_node;
    }

    generateAst(contexts: CfgElement[]): types.ForStatement | types.WhileStatement | types.DoWhileStatement | types.LabeledStatement {
        assert.ok(this.body.sequence.length > 0);

        const loop_body_first = this.body.sequence[0];
        if (loop_body_first instanceof CfgIfEscapeStructure && loop_body_first.cond_node.paths.length === 0) {
            const ifescape_body_first = loop_body_first.body.sequence[0];
            if (ifescape_body_first instanceof CfgBreakStructure && ifescape_body_first.nest_level === 0) {
                // while/for statement
                assert.ok(loop_body_first.cond_node.fork_path != null);

                contexts.push(this);
                const body_ast = types.blockStatement(new CfgSequential(this.body.sequence.slice(1)).generateAst(contexts));
                const cond_ast = types.cloneDeepWithoutLoc(loop_body_first.cond_node.fork_path.node);
                contexts.pop();

                if (this.loopin_node === this.continue_node) {
                    if (loop_body_first.escape_cond) {
                        return this.generateAstWrapIfHasLabel(types.whileStatement(types.unaryExpression('!', cond_ast), body_ast));
                    } else {
                        return this.generateAstWrapIfHasLabel(types.whileStatement(cond_ast, body_ast));
                    }
                } else {
                    // for statement
                    const update_expressions: types.Expression[] = [];

                    for (let path of this.continue_node.paths) {
                        if (path.isExpression()) {
                            update_expressions.push(types.cloneDeepWithoutLoc(path.node));
                        } else if (path.isExpressionStatement()) {
                            update_expressions.push(types.cloneDeepWithoutLoc(path.get('expression').node));
                        } else {
                            throw new Error(`not implemented: ${path}`);
                        }
                    }

                    if (this.continue_node.fork_path != null) {
                        update_expressions.push(types.cloneDeepWithoutLoc(this.continue_node.fork_path.node));
                    }

                    const update_ast = update_expressions.length > 1 ? types.sequenceExpression(update_expressions) : update_expressions[0];

                    if (loop_body_first.escape_cond) {
                        return this.generateAstWrapIfHasLabel(types.forStatement(null, types.unaryExpression('!', cond_ast), update_ast, body_ast));
                    } else {
                        return this.generateAstWrapIfHasLabel(types.forStatement(null, cond_ast, update_ast, body_ast));
                    }
                }
            }
        }

        if (this.body.sequence.length > 1) {
            const loop_body_last = this.body.sequence.at(-1)!;
            if (loop_body_last instanceof CfgIfEscapeStructure) {
                const ifescape_body_first = loop_body_last.body.sequence[0];
                if (ifescape_body_first instanceof CfgBreakStructure && ifescape_body_first.nest_level === 0) {
                    // do-while
                    assert.ok(loop_body_last.cond_node.fork_path != null);

                    contexts.push(this);
                    const body_statements = new CfgSequential(this.body.sequence.slice(0, -1))
                        .generateAst(contexts).concat(CfgSequential.generateAstFromPaths(loop_body_last.cond_node.paths));
                    const cond_ast = types.cloneDeepWithoutLoc(loop_body_last.cond_node.fork_path.node);
                    contexts.pop();

                    if (loop_body_last.escape_cond) {
                        return this.generateAstWrapIfHasLabel(types.doWhileStatement(types.unaryExpression('!', cond_ast), types.blockStatement(body_statements)));
                    } else {
                        return this.generateAstWrapIfHasLabel(types.doWhileStatement(cond_ast, types.blockStatement(body_statements)));
                    }
                }
            }
        }

        // while-true
        {
            contexts.push(this);
            const body_ast = types.blockStatement(this.body.generateAst(contexts));
            contexts.pop();

            return this.generateAstWrapIfHasLabel(types.whileStatement(types.booleanLiteral(true), body_ast));
        }
    }

    private generateAstWrapIfHasLabel(statement: types.ForStatement | types.WhileStatement | types.DoWhileStatement): types.ForStatement | types.WhileStatement | types.DoWhileStatement | types.LabeledStatement {
        return this.label != null ? types.labeledStatement(types.identifier(this.label), statement) : statement;
    }
}

class CfgContinueStructure {
    nest_level: number;

    constructor(nest_level: number) {
        this.nest_level = nest_level;
    }

    generateAst(contexts: CfgElement[]): types.ContinueStatement {
        if (this.nest_level === 0) {
            return types.continueStatement();
        } else {
            const loop_structure = contexts.filter((c): c is CfgLoopStructure => c instanceof CfgLoopStructure).reverse()[this.nest_level];
            if (loop_structure.label == null) {
                loop_structure.label = loop_structure.continue_node.getGraph().for_statement.scope.generateUid('loop');
            }
            return types.continueStatement(types.identifier(loop_structure.label));
        }
    }
}

class CfgBreakStructure {
    nest_level: number;

    constructor(nest_level: number) {
        this.nest_level = nest_level;
    }

    generateAst(contexts: CfgElement[]): types.BreakStatement {
        if (this.nest_level === 0) {
            return types.breakStatement();
        } else {
            const loop_structure = contexts.filter((c): c is CfgLoopStructure => c instanceof CfgLoopStructure).reverse()[this.nest_level];
            if (loop_structure.label == null) {
                loop_structure.label = loop_structure.continue_node.getGraph().for_statement.scope.generateUid('loop');
            }
            return types.breakStatement(types.identifier(loop_structure.label));
        }
    }
}

type CfgRecoveryContext =
    CfgRecoveryIfContext | CfgRecoveryIfEscapeContext | CfgRecoveryLoopContext;

interface CfgRecoveryIfContext {
    type: 'if';
    nodes: Set<DeflatBlock>;
    cond_node: DeflatBlock;
    converge_node: DeflatBlock;
}

interface CfgRecoveryIfEscapeContext {
    type: 'if-escape';
    nodes: Set<DeflatBlock>;
    exit_map: Map<DeflatBlock, [string, number]>;
}

interface CfgRecoveryLoopContext {
    type: 'loop';
    nodes: Set<DeflatBlock>;
    loopin_node: DeflatBlock;
    loopout_nodes: Set<DeflatBlock>;
    continue_node: DeflatBlock;
    break_node: DeflatBlock;
}

class CfgRecovery {
    graph: DeflatGraph;
    visited_edges: DeflatEdgeSet;
    root?: CfgSequential;

    constructor(graph: DeflatGraph) {
        this.graph = graph;
        this.visited_edges = new DeflatEdgeSet();
    }

    build(): CfgRecovery {
        this.root = this.buildSequential(this.graph.deflat_blocks[1], []);
        return this;
    }

    private markEdgeAsVisited(u: DeflatBlock, v: DeflatBlock) {
        if (this.visited_edges.hasEdge(u, v)) {
            const ui = u.getGraph().deflat_blocks.indexOf(u);
            const vi = v.getGraph().deflat_blocks.indexOf(v);
            throw new Error(`already visited (${ui}, ${vi}), cfg may be ill-formed.`);
        } else {
            this.visited_edges.addEdge(u, v);
        }
    }

    private calculateWeight(node: DeflatBlock, visit_path: DeflatBlock[]): number {
        if (visit_path.indexOf(node) >= 0) {
            return 0;
        } else if (this.graph.getSuccessorsNum(node) === 0) {
            return 1;
        } else {
            visit_path.push(node);
            const w = Math.max(...this.graph.getSuccessors(node).map(n => this.calculateWeight(n, visit_path))) + 1;
            visit_path.pop()
            return w;
        }
    }

    private searchIfConverge(cond_node: DeflatBlock, contexts: CfgRecoveryContext[]): DeflatBlock | undefined {
        const succ_nodes = cond_node.getGraph().getSuccessors(cond_node);
        assert.ok(succ_nodes.length === 2);
        assert.ok(cond_node != succ_nodes[0] && cond_node != succ_nodes[1]);

        let left_broadcast_nodes = new Set([succ_nodes[0]]);
        let right_broadcast_nodes = new Set([succ_nodes[1]]);

        const left_visited_nodes = new Set<DeflatBlock>();
        const right_visited_nodes = new Set<DeflatBlock>();

        for (let i = 0; true; ++i) {
            const left_visitable_nodes = [];
            for (let n of left_broadcast_nodes) {
                if (this.searchIfConvergeIsNodeVisitable(n, i, cond_node, contexts)) {
                    left_visitable_nodes.push(n);
                }
            }

            const right_visitable_nodes = [];
            for (let n of right_broadcast_nodes) {
                if (this.searchIfConvergeIsNodeVisitable(n, i, cond_node, contexts)) {
                    right_visitable_nodes.push(n);
                }
            }

            if (left_visitable_nodes.length === 0 && right_visitable_nodes.length === 0) {
                break;
            }

            left_visitable_nodes.forEach(n => left_visited_nodes.add(n));
            right_visitable_nodes.forEach(n => right_visited_nodes.add(n));

            const common_visited_nodes = new Set([...left_visited_nodes].filter(n => right_visited_nodes.has(n)));
            if (common_visited_nodes.size === 0) {
                left_broadcast_nodes = this.searchIfConvergeBroadcast(left_visitable_nodes, left_visited_nodes, i, cond_node, contexts)
                right_broadcast_nodes = this.searchIfConvergeBroadcast(right_visitable_nodes, right_visited_nodes, i, cond_node, contexts)
            } else if (common_visited_nodes.size === 1) {
                return common_visited_nodes.values().next().value;
            } else {
                throw new Error('multiple converge nodes, cfg may be ill-formed.');
            }
        }

        return undefined;
    }

    private searchIfConvergeIsNodeVisitable(node: DeflatBlock, iteration: number, cond_node: DeflatBlock, contexts: CfgRecoveryContext[]): boolean {
        if (contexts.length === 0) {
            return true;
        } else {
            const last_context = contexts.at(-1)!;
            switch (last_context.type) {
                case 'if':
                    return last_context.nodes.has(node) || node === last_context.converge_node;
                case 'if-escape':
                    return last_context.nodes.has(node) || last_context.exit_map.has(node);
                case 'loop':
                    return last_context.nodes.has(node);
                default:
                    throw new Error('');
            }
        }
    }

    private searchIfConvergeIsNodeBroadcastable(node: DeflatBlock, iteration: number, cond_node: DeflatBlock, contexts: CfgRecoveryContext[]): boolean {
        if (contexts.length === 0) {
            return true;
        } else {
            const last_context = contexts.at(-1)!;
            switch (last_context.type) {
                case 'if':
                    return node !== last_context.converge_node;
                case 'if-escape':
                    return !last_context.exit_map.has(node);
                case 'loop':
                    return node !== last_context.continue_node;
            }
        }
    }

    private searchIfConvergeBroadcast(nodes: DeflatBlock[], visited_nodes: Set<DeflatBlock>, iteration: number, cond_node: DeflatBlock, contexts: CfgRecoveryContext[]) {
        const new_broadcast = new Set<DeflatBlock>();
        for (let node of nodes) {
            if (this.searchIfConvergeIsNodeBroadcastable(node, iteration, cond_node, contexts)) {
                node.getGraph().getSuccessors(node)
                    .filter(n => !visited_nodes.has(n))
                    .forEach(n => new_broadcast.add(n));
            }
        }
        return new_broadcast;
    }

    private backwardTraverse(node: DeflatBlock, target_node: DeflatBlock, visit_path: DeflatBlock[], reachable_prefix: number, reachable_nodes: Set<DeflatBlock>, contexts: CfgRecoveryContext[]) {
        if (node === target_node || reachable_nodes.has(node)) {
            visit_path.slice(reachable_prefix).forEach(n => reachable_nodes.add(n));
            return true;
        } else if (visit_path.indexOf(node) >= 0) {
            return false;
        } else {
            if (contexts.length > 0) {
                const last_context = contexts.at(-1)!;
                switch (last_context.type) {
                    case 'if':
                        if (!last_context.nodes.has(node) || node === last_context.cond_node) {
                            return false;
                        }
                        break;
                    case 'if-escape':
                        if (!last_context.nodes.has(node)) {
                            return false;
                        }
                        break;
                    case 'loop':
                        if (!last_context.nodes.has(node) || node === last_context.loopin_node) {
                            return false;
                        }
                        break;
                }
            }

            let reachable = false;
            const revisit_pred_nodes: DeflatBlock[] = [];

            visit_path.push(node);
            for (let pred_node of node.getGraph().getPredecessors(node)) {
                if (reachable) {
                    this.backwardTraverse(pred_node, target_node, visit_path, reachable_prefix, reachable_nodes, contexts);
                } else {
                    if (this.backwardTraverse(pred_node, target_node, visit_path, reachable_prefix, reachable_nodes, contexts)) {
                        reachable = true;
                        reachable_prefix = visit_path.length;
                        revisit_pred_nodes.forEach(n => this.backwardTraverse(n, target_node, visit_path, reachable_prefix, reachable_nodes, contexts));
                    } else {
                        revisit_pred_nodes.push(pred_node);
                    }
                }
            }
            visit_path.pop();

            return reachable;
        }
    }

    private traverseIf(cond_node: DeflatBlock, converge_node: DeflatBlock, contexts: CfgRecoveryContext[]) {
        const if_nodes = new Set<DeflatBlock>();

        let reachable = false;
        for (let pred_node of converge_node.getGraph().getPredecessors(converge_node)) {
            if (this.backwardTraverse(pred_node, cond_node, [], 0, if_nodes, contexts)) {
                reachable = true;
            }
        }
        if (!reachable) {
            const cond_index = cond_node.getGraph().deflat_blocks.indexOf(cond_node);
            const converge_index = converge_node.getGraph().deflat_blocks.indexOf(converge_node);
            throw new Error(`the If converge_node ${converge_index} is not backward reachable to the If cond_node ${cond_index}, cfg may be ill-formed.`);
        }

        return if_nodes;
    }

    private traverseIfEscape(node: DeflatBlock, contexts: CfgRecoveryContext[]) {
        const nodes = new Set<DeflatBlock>();
        const exit_map = new Map<DeflatBlock, [string, number]>();
        this.traverseIfEscapeDfs(node, [], nodes, exit_map, contexts);
        return { nodes, exit_map };
    }

    private traverseIfEscapeDfs(node: DeflatBlock, visit_path: DeflatBlock[], reachable_nodes: Set<DeflatBlock>, exit_map: Map<DeflatBlock, [string, number]>, contexts: CfgRecoveryContext[]) {
        let visitable = true;

        if (contexts.length > 0) {
            const last_context = contexts.at(-1)!;
            switch (last_context.type) {
                case 'if':
                case 'loop':
                    // to `return`, continue current/outer loop, break current/outer loop
                    let nest_level = 0;
                    loop1: for (let [i, context] of contexts.slice().reverse().entries()) {
                        switch (context.type) {
                            case 'if':
                                break;
                            case 'if-escape':
                                throw new Error('not implemented yet.');
                            case 'loop':
                                if (node === context.continue_node) {
                                    if (last_context.type === 'loop') {
                                        assert.ok(nest_level > 0);
                                    }
                                    visitable = false;
                                    exit_map.set(node, ['continue', nest_level]);
                                    break loop1;
                                } else if (node === context.break_node) {
                                    visitable = false;
                                    exit_map.set(node, ['break', nest_level]);
                                    break loop1;
                                } else {
                                    ++nest_level;
                                }
                                break;
                        }
                    }
                    break;
                case 'if-escape':
                    throw new Error('not implemented yet.');
            }
        }

        if (visitable) {
            reachable_nodes.add(node);

            visit_path.push(node);
            for (let succ_node of node.getGraph().getSuccessors(node)) {
                if (visit_path.indexOf(succ_node) >= 0 || reachable_nodes.has(succ_node)) {
                    // pass
                } else {
                    this.traverseIfEscapeDfs(succ_node, visit_path, reachable_nodes, exit_map, contexts);
                }
            }
            visit_path.pop();
        }
    }

    private traverseLoop(pred_nodes: DeflatBlock[], loopin_node: DeflatBlock, contexts: CfgRecoveryContext[]) {
        const loop_nodes = new Set<DeflatBlock>();

        for(let pred_node of pred_nodes) {
            if (this.backwardTraverse(pred_node, loopin_node, [], 0, loop_nodes, contexts)) {
                // pass
            } else {
                const loopin_index = loopin_node.getGraph().deflat_blocks.indexOf(loopin_node);
                throw new Error(`some pred nodes of ${loopin_index} are not a part of loop body, cfg may be ill-formed.`);
            }
        }

        loop_nodes.add(loopin_node);
        return loop_nodes;
    }

    private searchLoopoutNodes(loopin_node: DeflatBlock, loop_nodes: Set<DeflatBlock>) {
        const loopout_nodes = new Set<DeflatBlock>();
        const visited_nodes = new Set<DeflatBlock>();

        this.searchLoopoutNodesDfs(loopin_node, loop_nodes, visited_nodes, loopout_nodes)
        return loopout_nodes
    }

    private searchLoopContinueNode(loopin_node: DeflatBlock, loop_nodes: Set<DeflatBlock>) {
        const nodes = this.graph.getPredecessors(loopin_node).filter(n => loop_nodes.has(n));
        if (nodes.length === 1) {
            return this.graph.getPredecessorsNum(nodes[0]) > 1 && this.graph.getSuccessorsNum(nodes[0]) === 1 ? nodes[0] : loopin_node;
        } else {
            assert.ok(nodes.length > 1);
            return loopin_node;
        }
    }

    private searchLoopBreakNode(loop_nodes: Set<DeflatBlock>, loopout_nodes: Set<DeflatBlock>) {
        if (loopout_nodes.size == 1) {
            return loopout_nodes.values().next().value;
        } else {
            const nodes = [];

            for (let loopout_node of loopout_nodes) {
                if (loopout_node.getGraph().getPredecessors(loopout_node).length > 1) {
                    nodes.push(loopout_node);
                }
            }

            if (nodes.length === 1) {
                return nodes[0];
            } else {
                throw new Error('not implemented yet.');
            }
        }
    }

    private searchLoopoutNodesDfs(node: DeflatBlock, loop_nodes: Set<DeflatBlock>, visited_nodes: Set<DeflatBlock>, loopout_nodes: Set<DeflatBlock>) {
        if (visited_nodes.has(node)) {
            return;
        } else {
            visited_nodes.add(node);
        }

        if (loop_nodes.has(node)) {
            for (let succ_node of node.getGraph().getSuccessors(node)) {
                this.searchLoopoutNodesDfs(succ_node, loop_nodes, visited_nodes, loopout_nodes);
            }
        } else {
            loopout_nodes.add(node);
        }
    }

    private buildSequential(node: DeflatBlock, contexts: CfgRecoveryContext[]): CfgSequential {
        const sequence = []

        let prev_node: DeflatBlock | undefined = undefined;
        let current_node: DeflatBlock = node;

main_loop: while (true) {
            if (prev_node != null) {
                this.markEdgeAsVisited(prev_node, current_node);
            }

            if (contexts.length > 0) {
                const last_context = contexts.at(-1)!;
                switch (last_context.type) {
                    case 'if':
                        if (current_node === last_context.converge_node) {
                            break main_loop;
                        }
                        break;
                    case 'if-escape':
                        if (last_context.exit_map.has(current_node)) {
                            const exit_info = last_context.exit_map.get(current_node)!;
                            if (exit_info[0] === 'continue') {
                                sequence.push(new CfgContinueStructure(exit_info[1]));
                            } else if (exit_info[0] === 'break') {
                                sequence.push(new CfgBreakStructure(exit_info[1]));
                            } else {
                                throw new Error('TODO');
                            }
                            break main_loop;
                        }
                        break;
                    case 'loop':
                        if (sequence.length > 0 && current_node === last_context.continue_node) {
                            break main_loop;
                        }
                        break;
                }
            }

            const pred_nodes = current_node.getGraph().getPredecessors(current_node);
            const succ_nodes = current_node.getGraph().getSuccessors(current_node);

            const proper_pred_nodes: DeflatBlock[] = [];
            do {
                if (contexts.length > 0) {
                    const last_context =  contexts.at(-1)!;
                    if (last_context.type === 'loop' && current_node === last_context.loopin_node) {
                        break;
                    }
                }

                pred_nodes.forEach(n => {
                    if (!this.visited_edges.hasEdge(n, current_node)) {
                        proper_pred_nodes.push(n);
                    }
                });
            } while (false);

            if (proper_pred_nodes.length === 0) {
                if (succ_nodes.length === 0) {
                    sequence.push(current_node);
                    break;
                } else if (succ_nodes.length === 1) {
                    sequence.push(current_node);
                    prev_node = current_node;
                    current_node = succ_nodes[0];
                } else {
                    assert.ok(succ_nodes.length === 2);

                    const converge_node = this.searchIfConverge(current_node, contexts);
                    if (converge_node == null) {
                        if (contexts.length === 0) {
                            const true_weight = this.calculateWeight(succ_nodes[0], []);
                            const false_weight = this.calculateWeight(succ_nodes[1], []);

                            const { nodes: if_escape_nodes, exit_map: if_escape_exit_map } = this.traverseIfEscape(true_weight < false_weight ? succ_nodes[0] : succ_nodes[1], contexts);
                            const if_escape_structure = this.buildIfEscape(if_escape_nodes, current_node, true_weight < false_weight, if_escape_exit_map, contexts);

                            sequence.push(if_escape_structure);

                            prev_node = undefined;
                            current_node = if_escape_structure.exit();
                        } else {
                            const last_context = contexts.at(-1)!;
                            switch (last_context.type) {
                                case 'if':
                                    const true_in_if = last_context.nodes.has(succ_nodes[0]) || succ_nodes[0] == last_context.converge_node;
                                    const false_in_if = last_context.nodes.has(succ_nodes[1]) || succ_nodes[1] == last_context.converge_node;

                                    assert.ok(true_in_if != false_in_if);

                                    {
                                        const { nodes: if_escape_nodes, exit_map: if_escape_exit_map } = this.traverseIfEscape(false_in_if ? succ_nodes[0] : succ_nodes[1], contexts);
                                        const if_escape_structure = this.buildIfEscape(if_escape_nodes, current_node, false_in_if, if_escape_exit_map, contexts);

                                        sequence.push(if_escape_structure);

                                        prev_node = undefined;
                                        current_node = if_escape_structure.exit();
                                    }

                                    break;
                                case 'loop':
                                    const true_in_loop = last_context.nodes.has(succ_nodes[0]);
                                    const false_in_loop = last_context.nodes.has(succ_nodes[1]);

                                    assert.ok(true_in_loop != false_in_loop);

                                    {
                                        const { nodes: if_escape_nodes, exit_map: if_escape_exit_map } = this.traverseIfEscape(false_in_loop ? succ_nodes[0] : succ_nodes[1], contexts);
                                        const if_escape_structure = this.buildIfEscape(if_escape_nodes, current_node, false_in_loop, if_escape_exit_map, contexts);

                                        sequence.push(if_escape_structure);

                                        prev_node = undefined;
                                        current_node = if_escape_structure.exit();
                                    }

                                    break;
                                default:
                                    throw new Error('not implemented yet.');
                            }
                        }
                    } else {
                        const if_nodes = this.traverseIf(current_node, converge_node, contexts);
                        const if_structure = this.buildIf(if_nodes, current_node, converge_node, contexts);

                        sequence.push(if_structure);

                        prev_node = undefined;
                        current_node = if_structure.exit();
                    }
                }
            } else {
                const loop_nodes = this.traverseLoop(proper_pred_nodes, current_node, contexts);
                const loopout_nodes = this.searchLoopoutNodes(current_node, loop_nodes);
                const continue_node = this.searchLoopContinueNode(current_node, loop_nodes);
                const break_node = this.searchLoopBreakNode(loop_nodes, loopout_nodes);

                if (loopout_nodes.size === 0) {
                    throw new Error('not implemented yet: infinity loop');
                } else {
                    assert.ok(succ_nodes.length > 0);
                    const loop_structure = this.buildLoop(loop_nodes, current_node, loopout_nodes, continue_node, break_node, contexts)

                    sequence.push(loop_structure);

                    prev_node = undefined;
                    current_node = loop_structure.exit();
                }
            }
        }

        return new CfgSequential(sequence);
    }

    private buildIf(nodes: Set<DeflatBlock>, cond_node: DeflatBlock, converge_node: DeflatBlock, contexts: CfgRecoveryContext[]) {
        const succ_nodes = cond_node.getGraph().getSuccessors(cond_node);
        assert.ok(succ_nodes.length === 2);

        this.markEdgeAsVisited(cond_node, succ_nodes[0]);
        this.markEdgeAsVisited(cond_node, succ_nodes[1]);

        let true_body: CfgSequential | undefined;
        if (succ_nodes[0] === converge_node) {
            true_body = undefined;
        } else {
            contexts.push({ 'type': 'if', 'nodes': nodes, 'cond_node': cond_node, 'converge_node': converge_node });
            true_body = this.buildSequential(succ_nodes[0], contexts);
            contexts.pop();
        }

        let false_body: CfgSequential | undefined;
        if (succ_nodes[1] === converge_node) {
            false_body = undefined;
        } else {
            contexts.push({ 'type': 'if', 'nodes': nodes, 'cond_node': cond_node, 'converge_node': converge_node });
            false_body = this.buildSequential(succ_nodes[1], contexts);
            contexts.pop();
        }

        assert.ok(true_body != null || false_body != null);
        return new CfgIfStructure(nodes, cond_node, converge_node, true_body, false_body);
    }

    private buildIfEscape(nodes: Set<DeflatBlock>, cond_node: DeflatBlock, escape_cond: boolean, exit_map: Map<DeflatBlock, [string, number]>, contexts: CfgRecoveryContext[]) {
        const succ_nodes = cond_node.getGraph().getSuccessors(cond_node);
        assert.ok(succ_nodes.length === 2);

        this.markEdgeAsVisited(cond_node, succ_nodes[0]);
        this.markEdgeAsVisited(cond_node, succ_nodes[1]);

        contexts.push({ 'type': 'if-escape', 'nodes': nodes, 'exit_map': exit_map });
        const body = this.buildSequential(escape_cond ? succ_nodes[0] : succ_nodes[1], contexts);
        contexts.pop();

        return new CfgIfEscapeStructure(nodes, cond_node, escape_cond, succ_nodes[0], succ_nodes[1], body)
    }

    private buildLoop(nodes: Set<DeflatBlock>, loopin_node: DeflatBlock, loopout_nodes: Set<DeflatBlock>, continue_node: DeflatBlock, break_node: DeflatBlock, contexts: CfgRecoveryContext[]) {
        contexts.push({ 'type': 'loop', 'nodes': nodes, 'loopin_node': loopin_node, 'loopout_nodes': loopout_nodes, 'continue_node': continue_node, 'break_node': break_node });
        const body = this.buildSequential(loopin_node, contexts)
        contexts.pop()

        if (loopin_node !== continue_node) {
            this.markEdgeAsVisited(continue_node, loopin_node);
        }

        return new CfgLoopStructure(nodes, loopin_node, loopout_nodes, continue_node, break_node, body)
    }
}

function splitSSAExpressions(ast: types.Expression, expressions: types.Expression[]): types.Expression {
    if (types.isBooleanLiteral(ast)) {
        return types.booleanLiteral(ast.value);
    } else if (types.isNumericLiteral(ast)) {
        return types.numericLiteral(ast.value);
    } else if (types.isStringLiteral(ast)) {
        return types.stringLiteral(ast.value);
    } else if (types.isIdentifier(ast)) {
        return types.identifier(ast.name);
    } else if (types.isAssignmentExpression(ast) && types.isIdentifier(ast.left)) {
        const left = types.identifier(ast.left.name);
        const right = splitSSAExpressions(ast.right, expressions);
        expressions.push(types.assignmentExpression(ast.operator, left, right));
        return left;
    } else if (types.isUnaryExpression(ast)) {
        return types.unaryExpression(ast.operator, splitSSAExpressions(ast.argument, expressions), ast.prefix);
    } else if (types.isBinaryExpression(ast) && types.isExpression(ast.left)) {
        const left = splitSSAExpressions(ast.left, expressions);
        const right = splitSSAExpressions(ast.right, expressions);
        return types.binaryExpression(ast.operator, left, right);
    } else if (types.isMemberExpression(ast) && types.isExpression(ast.property)) {
        const object = splitSSAExpressions(ast.object, expressions);
        const property = splitSSAExpressions(ast.property, expressions);
        return types.memberExpression(object, property, ast.computed, ast.optional);
    } else {
        throw Error(`Not implemented: ${generator.default(ast).code}`);
    }
}

class InequalityPredicateAnalyser {
    fork_block: DeflatBlock;

    z3_variables: Map<string, [boolean, Array<z3js.Bool | z3js.BitVec<32> | z3js.Arith>]>;
    z3_constraints: z3js.Bool[];

    z3_pred_true?: z3js.Bool;
    z3_pred_false?: z3js.Bool;

    constructor(fork_block: DeflatBlock) {
        this.fork_block = fork_block;
        this.z3_variables = new Map();
        this.z3_constraints = [];
    }

    isAnalysable(ast: types.Expression): boolean {
        if (types.isBooleanLiteral(ast)) {
            return true;
        } else if (types.isNumericLiteral(ast)) {
            return Number.isSafeInteger(ast.value);
        } else if (types.isStringLiteral(ast)) {
            return false;
        } else if (types.isIdentifier(ast)) {
            return true;
        } else if (types.isArrayExpression(ast)) {
            return false
        } else if (types.isAssignmentExpression(ast) && types.isExpression(ast.left)) {
            switch (ast.operator) {
                case '=':
                case '+=':
                case '-=':
                case '*=':
                case '<<=':
                case '>>=':
                case '>>>=':
                case '&=':
                case '^=':
                case '|=':
                case '&&=':
                case '||=':
                    return this.isAnalysable(ast.left) && this.isAnalysable(ast.right);
                case '%=':
                case '**=':
                    return false;
                default:
                    throw new Error(`Not implemented: ${generator.default(ast).code}`);
            }
        } else if (types.isUnaryExpression(ast)) {
            switch (ast.operator) {
                case '!':
                case '+':
                case '-':
                case '~':
                    return this.isAnalysable(ast.argument);
                case 'void':
                case 'throw':
                case 'delete':
                case 'typeof':
                    return false;
                default:
                    throw new Error(`Not implemented: ${generator.default(ast).code}`);
            }
        } else if (types.isBinaryExpression(ast) && types.isExpression(ast.left)) {
            switch (ast.operator) {
                case '+':
                case '-':
                case '*':
                case '<':
                case '>':
                case '<=':
                case '>=':
                case '==':
                case '!=':
                case '===':
                case '!==':
                case '&':
                case '|':
                case '^':
                case '<<':
                case '>>':
                case '>>>':
                    return this.isAnalysable(ast.left) && this.isAnalysable(ast.right);
                case '/':
                case '%':
                case '**':
                    return false
                case 'in':
                case 'instanceof':
                    return true;
                default:
                    throw new Error(`Not implemented: ${generator.default(ast).code}`);
            }
        } else if (types.isUpdateExpression(ast)) {
            return true;
        } else if (types.isMemberExpression(ast)) {
            return false;
        } else if (types.isCallExpression(ast)) {
            return false;
        } else if (types.isFunctionExpression(ast)) {
            return false;
        } else {
            throw new Error(`Not implemented: ${generator.default(ast).code}`);
        }
    }

    buildZ3Variable(name: string, stage_level: 0): z3js.Bool | undefined;
    buildZ3Variable(name: string, stage_level: 1): z3js.Arith | undefined;
    buildZ3Variable(name: string, stage_level: 2): z3js.BitVec<32> | undefined;
    buildZ3Variable(name: string, stage_level: 0 | 1 | 2): z3js.Bool | z3js.BitVec<32> | z3js.Arith | undefined;

    buildZ3Variable(name: string, stage_level: 0 | 1 | 2): z3js.Bool | z3js.BitVec<32> | z3js.Arith | undefined {
        if (!this.z3_variables.has(name)) {
            this.z3_variables.set(name, [true, []]);
        }
        let [is_defined, variables] = this.z3_variables.get(name)!;
        if (is_defined) {
            let suffix_index = variables.length;

            let variable: z3js.Bool | z3js.BitVec<32> | z3js.Arith;
            if (stage_level === 0) {
                variable = Z3Context.Bool.const(`${name}.${suffix_index}`);
            } else if (stage_level === 1) {
                variable = Z3Context.Int.const(`${name}.${suffix_index}`);
            } else {
                variable = Z3Context.BitVec.const(`${name}.${suffix_index}`, 32);
            }

            variables.push(variable);
            if (name !== '@temp') {
                this.z3_variables.get(name)![0] = false;
            }

            return variable;
        } else {
            let variable = variables.at(-1);
            if (z3js.isBool(variable) && stage_level === 0) {
                return variable;
            } else if (z3js.isArith(variable) && stage_level === 1) {
                return variable;
            } else if (z3js.isBitVec(variable) && stage_level === 2) {
                return variable;
            } else {
                return undefined;
            }
        }
    }

    buildZ3Expression(ast: types.Expression, stage_level: 0): z3js.Bool | undefined;
    buildZ3Expression(ast: types.Expression, stage_level: 1): z3js.Arith | undefined;
    buildZ3Expression(ast: types.Expression, stage_level: 2): z3js.BitVec<32> | undefined;
    buildZ3Expression(ast: types.Expression, stage_level: 0 | 1 | 2): z3js.Bool | z3js.BitVec<32> | z3js.Arith | undefined;

    buildZ3Expression(ast: types.Expression, stage_level: 0 | 1 | 2): z3js.Bool | z3js.BitVec<32> | z3js.Arith | undefined {
        if (types.isBooleanLiteral(ast)) {
            if (stage_level === 0) {
                return Z3Context.Bool.val(ast.value);
            } else if (stage_level === 1) {
                return Z3Context.Int.val(ast.value ? 1 : 0);
            } else {
                return Z3Context.BitVec.val(ast.value ? 1 : 0, 32);
            }
        } else if (types.isNumericLiteral(ast)) {
            if (stage_level === 0) {
                return Z3Context.Bool.val(!!ast.value);
            } else if (stage_level === 1) {
                return Z3Context.Int.val(ast.value);
            } else {
                return Z3Context.BitVec.val(ast.value, 32);
            }
        } else if (types.isIdentifier(ast)) {
            if (stage_level === 0) {
                return this.buildZ3Variable(ast.name, stage_level);
            } else if (stage_level === 1) {
                let z3_identifier = this.buildZ3Variable(ast.name, 1);
                if (z3_identifier == null) {
                    const z3_identifier_bv = this.buildZ3Variable(ast.name, 2);
                    if (z3_identifier_bv != null) {
                        z3_identifier = this.buildZ3Variable('@temp', 1)!;
                        this.z3_constraints.push(z3_identifier.eq(z3js.BV2Int(z3_identifier_bv, true)));
                    }
                }
                return z3_identifier;
            } else {
                return this.buildZ3Variable(ast.name, stage_level);
            }
        } else if (types.isUnaryExpression(ast)) {
            switch (ast.operator) {
                case '!':
                    if (stage_level === 0) {
                        let z3_argument = this.buildZ3Expression(ast.argument, 0);
                        return z3_argument === undefined ? undefined : z3_argument.not();
                    } else if (stage_level === 1) {
                        let z3_temp = this.buildZ3Variable('@temp', 1)!;

                        let z3_temp_is_0 = z3_temp.eq(Z3Context.Int.val(0));
                        let z3_temp_is_1 = z3_temp.eq(Z3Context.Int.val(1));

                        this.z3_constraints.push(z3_temp_is_0.or(z3_temp_is_1))
                        return z3_temp;
                    } else {
                        let z3_temp = this.buildZ3Variable('@temp', 2)!;

                        let z3_temp_is_0 = z3_temp.eq(Z3Context.BitVec.val(0, 32));
                        let z3_temp_is_1 = z3_temp.eq(Z3Context.BitVec.val(1, 32));

                        this.z3_constraints.push(z3_temp_is_0.or(z3_temp_is_1))
                        return z3_temp;
                    }
                case '+':
                    if (stage_level === 0) {
                        throw new Error(`Not implemented: ${generator.default(ast).code}`);
                    } else if (stage_level === 1) {
                        return this.buildZ3Expression(ast.argument, 1);
                    } else {
                        throw new Error(`Not implemented: ${generator.default(ast).code}`);
                    }
                case '-':
                    if (stage_level === 0) {
                        throw new Error(`Not implemented: ${generator.default(ast).code}`);
                    } else if (stage_level === 1) {
                        let z3_argument = this.buildZ3Expression(ast.argument, 1);
                        return z3_argument === undefined ? undefined : z3_argument.neg();
                    } else {
                        throw new Error(`Not implemented: ${generator.default(ast).code}`);
                    }
                case '~':
                    if (stage_level === 0) {
                        return undefined;
                    } else if (stage_level === 1) {
                        throw new Error(`Not implemented: ${generator.default(ast).code}`);
                    } else {
                        let z3_argument = this.buildZ3Expression(ast.argument, 2);
                        return z3_argument === undefined ? undefined : z3_argument.not();
                    }
                default:
                    throw new Error(`Not implemented: ${generator.default(ast).code}`);
            }
        } else if (types.isBinaryExpression(ast) && types.isExpression(ast.left)) {
            switch (ast.operator) {
                case '+':
                case '-':
                case '*':
                    if (stage_level === 0) {
                        throw new Error(`Not implemented: ${generator.default(ast).code}`);
                    } else if (stage_level === 1) {
                        let z3_left = this.buildZ3Expression(ast.left, 1);
                        let z3_right = this.buildZ3Expression(ast.right, 1);
                        if (z3_left === undefined || z3_right === undefined) {
                            return undefined;
                        } else {
                            switch (ast.operator) {
                                case '+':
                                    return z3_left.add(z3_right);
                                case '-':
                                    return z3_left.sub(z3_right);
                                case '*':
                                    return z3_left.mul(z3_right);
                                default:
                                    throw new Error(`Not implemented for operator ${ast.operator}.`);
                            }
                        }
                    } else {
                        return undefined;
                    }
                case '<':
                case '>':
                case '<=':
                case '>=':
                    if (stage_level === 0) {
                        let z3_left = this.buildZ3Expression(ast.left, 1);
                        let z3_right = this.buildZ3Expression(ast.right, 1);
                        if (z3_left === undefined || z3_right === undefined) {
                            return undefined;
                        } else {
                            switch (ast.operator) {
                                case '<':
                                    return z3_left.lt(z3_right);
                                case '>':
                                    return z3_left.gt(z3_right);
                                case '<=':
                                    return z3_left.le(z3_right);
                                case '>=':
                                    return z3_left.ge(z3_right);
                                default:
                                    throw new Error(`Not implemented for operator ${ast.operator}.`);
                            }
                        }
                    } else if (stage_level === 1) {
                        let z3_temp = this.buildZ3Variable('@temp', 1)!;

                        let z3_temp_is_0 = z3_temp.eq(Z3Context.Int.val(0));
                        let z3_temp_is_1 = z3_temp.eq(Z3Context.Int.val(1));

                        this.z3_constraints.push(z3_temp_is_0.or(z3_temp_is_1))
                        return z3_temp;
                    } else {
                        let z3_temp = this.buildZ3Variable('@temp', 2)!;

                        let z3_temp_is_0 = z3_temp.eq(Z3Context.BitVec.val(0, 32));
                        let z3_temp_is_1 = z3_temp.eq(Z3Context.BitVec.val(1, 32));

                        this.z3_constraints.push(z3_temp_is_0.or(z3_temp_is_1))
                        return z3_temp;
                    }
                case '&':
                case '|':
                case '^':
                case '<<':
                case '>>':
                    if (stage_level === 0) {
                        return undefined;
                    } else {
                        let z3_left = this.buildZ3Expression(ast.left, 2);
                        let z3_right = this.buildZ3Expression(ast.right, 2);
                        if (z3_left === undefined || z3_right === undefined) {
                            return undefined
                        } else {
                            let z3_result: z3js.BitVec<32>;

                            switch (ast.operator) {
                                case '&':
                                    z3_result = z3_left.and(z3_right);
                                    break;
                                case '|':
                                    z3_result = z3_left.or(z3_right);
                                    break;
                                case '^':
                                    z3_result = z3_left.xor(z3_right);
                                    break;
                                case '<<':
                                    z3_result = z3_left.shl(z3_right.urem(Z3Context.BitVec.val(32, 32)));
                                    break;
                                case '>>':
                                    z3_result = z3_left.ashr(z3_right.urem(Z3Context.BitVec.val(32, 32)));
                                    break;
                                default:
                                    throw new Error(`Not implemented for operator ${ast.operator}.`);
                            }

                            if (stage_level === 1) {
                                let z3_temp_int = this.buildZ3Variable('@temp', 1)!;
                                let z3_temp_bv32 = this.buildZ3Variable('@temp', 2)!;
                                this.z3_constraints.push(z3_temp_bv32.eq(z3_result));
                                this.z3_constraints.push(z3_temp_int.eq(z3js.BV2Int(z3_temp_bv32, true)));
                                return z3_temp_int;
                            } else {
                                return z3_result;
                            }
                        }
                    }
                case '==':
                case '===':
                case '!=':
                case '!==':
                    if (stage_level === 0) {
                        return undefined;
                    } else if (stage_level === 1) {
                        let z3_temp = this.buildZ3Variable('@temp', 1)!;

                        let z3_temp_is_0 = z3_temp.eq(Z3Context.Int.val(0));
                        let z3_temp_is_1 = z3_temp.eq(Z3Context.Int.val(1));

                        this.z3_constraints.push(z3_temp_is_0.or(z3_temp_is_1))
                        return z3_temp;
                    } else {
                        let z3_temp = this.buildZ3Variable('@temp', 2)!;

                        let z3_temp_is_0 = z3_temp.eq(Z3Context.BitVec.val(0, 32));
                        let z3_temp_is_1 = z3_temp.eq(Z3Context.BitVec.val(1, 32));

                        this.z3_constraints.push(z3_temp_is_0.or(z3_temp_is_1))
                        return z3_temp;
                    }
                case 'in':
                case 'instanceof':
                    if (stage_level === 0) {
                        return undefined;
                    } else if (stage_level === 1) {
                        let z3_temp = this.buildZ3Variable('@temp', 1)!;

                        let z3_temp_is_0 = z3_temp.eq(Z3Context.Int.val(0));
                        let z3_temp_is_1 = z3_temp.eq(Z3Context.Int.val(1));

                        this.z3_constraints.push(z3_temp_is_0.or(z3_temp_is_1))
                        return z3_temp;
                    } else {
                        let z3_temp = this.buildZ3Variable('@temp', 2)!;

                        let z3_temp_is_0 = z3_temp.eq(Z3Context.BitVec.val(0, 32));
                        let z3_temp_is_1 = z3_temp.eq(Z3Context.BitVec.val(1, 32));

                        this.z3_constraints.push(z3_temp_is_0.or(z3_temp_is_1))
                        return z3_temp;
                    }
                default:
                    throw new Error(`Not implemented: ${generator.default(ast).code}`);
            }
        } else {
            throw new Error(`Not implemented: ${generator.default(ast).code}`);
        }
    }

    getUndefinedVariables(): Array<string> {
        let unknown_variables = new Set<string>();
        for (const [k, v] of this.z3_variables.entries()) {
            if (!v[0]) {
                unknown_variables.add(k);
            }
        }
        return [...unknown_variables];
    }

    defineVariable(name: string): z3js.Bool | z3js.Arith | z3js.BitVec<32> | undefined {
        if (this.z3_variables.has(name)) {
            let variable_desc = this.z3_variables.get(name)!;
            if (variable_desc[0]) {
                return undefined;
            } else {
                variable_desc[0] = true;
                return variable_desc[1].at(-1);
            }
        }
        return undefined;
    }

    withConstraint(ast: types.Expression): boolean {
        assert.ok(types.isAssignmentExpression(ast) && types.isIdentifier(ast.left));

        let z3_identifier = this.defineVariable(ast.left.name);
        if (z3_identifier === undefined) {
            return true;
        }

        switch (ast.operator) {
            case '=':
                if (z3js.isBool(z3_identifier)) {
                    let z3_constraint = this.buildZ3Expression(ast.right, 0);
                    if (z3_constraint === undefined) {
                        return false;
                    } else {
                        this.z3_constraints.push(z3_identifier.eq(z3_constraint));
                        return true;
                    }
                } else if (z3js.isArith(z3_identifier)) {
                    let z3_constraint = this.buildZ3Expression(ast.right, 1);
                    if (z3_constraint === undefined) {
                        return false;
                    } else {
                        this.z3_constraints.push(z3_identifier.eq(z3_constraint));
                        return true;
                    }
                } else {
                    let z3_constraint = this.buildZ3Expression(ast.right, 2);
                    if (z3_constraint === undefined) {
                        return false;
                    } else {
                        this.z3_constraints.push(z3_identifier.eq(z3_constraint));
                        return true;
                    }
                }
            case '+=':
            case '-=':
            case '*=':
                if (z3js.isBool(z3_identifier)) {
                    return false;
                } else if (z3js.isArith(z3_identifier)) {
                    let z3_arithassign_left = this.buildZ3Variable(ast.left.name, 1);
                    let z3_arithassign_right = this.buildZ3Expression(ast.right, 1);
                    assert.ok(z3_arithassign_left !== undefined);

                    if (z3_arithassign_right === undefined) {
                        return false;
                    } else {
                        switch (ast.operator) {
                            case '+=':
                                this.z3_constraints.push(z3_identifier.eq(z3_arithassign_left.add(z3_arithassign_right)));
                                break;
                            case '-=':
                                this.z3_constraints.push(z3_identifier.eq(z3_arithassign_left.sub(z3_arithassign_right)));
                                break;
                            case '*=':
                                this.z3_constraints.push(z3_identifier.eq(z3_arithassign_left.mul(z3_arithassign_right)));
                                break;
                            default:
                                throw new Error(`Not implemented for operator ${ast.operator}.`);
                        }
                        return true;
                    }
                } else {
                    return false;
                }
            case '&=':
            case '|=':
            case '^=':
            case '>>=':
            case '<<=':
                if (z3js.isBool(z3_identifier)) {
                    return false;
                } else {
                    let z3_bitwiseassign_left = this.buildZ3Variable(ast.left.name, 2);
                    let z3_bitwiseassign_right = this.buildZ3Expression(ast.right, 2);
                    assert.ok(z3_bitwiseassign_left !== undefined);

                    if (z3_bitwiseassign_right === undefined) {
                        return false;
                    } else {
                        let z3_constraint: z3js.BitVec<32>;
                        switch (ast.operator) {
                            case '&=':
                                z3_constraint = z3_bitwiseassign_left.and(z3_bitwiseassign_right);
                                break;
                            case '|=':
                                z3_constraint = z3_bitwiseassign_left.or(z3_bitwiseassign_right);
                                break;
                            case '^=':
                                z3_constraint = z3_bitwiseassign_left.xor(z3_bitwiseassign_right);
                                break;
                            case '<<=':
                                z3_constraint = z3_bitwiseassign_left.shl(z3_bitwiseassign_right.urem(Z3Context.BitVec.val(32, 32)));
                                break;
                            case '>>=':
                                z3_constraint = z3_bitwiseassign_left.ashr(z3_bitwiseassign_right.urem(Z3Context.BitVec.val(32, 32)));
                                break;
                            default:
                                throw new Error(`Not implemented for operator ${ast.operator}.`);
                        }
                        if (z3js.isBitVec(z3_identifier)) {
                            this.z3_constraints.push(z3_identifier.eq(z3_constraint));
                        } else {
                            let z3_temp = this.buildZ3Variable('@temp', 2)!;
                            this.z3_constraints.push(z3_temp.eq(z3_constraint));
                            this.z3_constraints.push(z3_identifier.eq(z3js.BV2Int(z3_temp, true)));
                        }
                        return true;
                    }
                }
            default:
                throw new Error(`Not implemented: ${generator.default(ast).code}`);
        }
    }

    checkSatisfiability(): ['sat' | 'unsat', 'sat' | 'unsat'] {
        let true_satisfiability: z3js.CheckSatResult;
        let false_satisfiability: z3js.CheckSatResult;

        do {
            {
                let solver = Z3Context.Solver.new();

                this.z3_constraints.forEach(c => solver.assert(c));
                solver.assert(this.z3_pred_true!);

                true_satisfiability = solver.check();
            }

            {
                let solver = Z3Context.Solver.new();

                this.z3_constraints.forEach(c => solver.assert(c));
                solver.assert(this.z3_pred_false!);

                false_satisfiability = solver.check();
            }
        } while (true_satisfiability === 'unknown' || false_satisfiability === 'unknown');

        return [true_satisfiability, false_satisfiability];
    }

    analyse(): { confident: boolean, value?: boolean } {
        assert.ok(this.fork_block.fork_path != null);

        this.z3_variables.clear();
        this.z3_constraints.splice(0, this.z3_constraints.length);

        if (this.isAnalysable(this.fork_block.fork_path.node)) {
            let ssa_ast: types.Expression[] = [];
            let pred_ast = splitSSAExpressions(this.fork_block.fork_path.node, ssa_ast);

            let z3_pred = this.buildZ3Expression(pred_ast, 0);
            if (z3_pred === undefined) {
                return { confident: false };
            }

            this.z3_pred_true = z3_pred;
            this.z3_pred_false = z3_pred.not();

            for (let assignment_ast of ssa_ast.slice().reverse()) {
                if (!this.withConstraint(assignment_ast)) {
                    return { confident: false };
                }
            }

            const [true_satisfiability, false_satisfiability] = this.checkSatisfiability();
            if (true_satisfiability === 'sat' && false_satisfiability === 'unsat') {
                return { confident: true, value: true };
            } else if (true_satisfiability === 'unsat' && false_satisfiability === 'sat') {
                return { confident: true, value: false };
            } else {
                assert.ok(true_satisfiability === 'sat' && false_satisfiability === 'sat');
                return this.analyseMore();
            }
        } else {
            return { confident: false };
        }
    }

    analyseMore(): { confident: boolean, value?: boolean } {
        for (let current_block = this.fork_block, unknown_variables = this.getUndefinedVariables(); unknown_variables.length > 0;) {
            let bindings = unknown_variables
                .map(name => current_block.getGraph().for_statement.scope.getBinding(name))
                .filter((b): b is traverse.Binding => b != null);

            if (bindings.length === 0) {
                return { confident: false };
            }

            let current_paths = current_block === this.fork_block || current_block.fork_path == null
                ? current_block.paths
                : current_block.paths.concat(current_block.fork_path);

            for (let i = current_paths.length - 1; 0 <= i; --i) {
                let path = current_paths[i];

                if (!bindings.some(b => b.constantViolations.some(cv => cv.node === path.node || cv.isDescendant(path)))) {
                    continue;
                }

                let ssa_asts: types.Expression[] = [];
                if (path.isExpression()) {
                    if (this.isAnalysable(path.node)) {
                        splitSSAExpressions(path.node, ssa_asts);
                    } else {
                        return { confident: false };
                    }
                } else if (path.isExpressionStatement()) {
                    if (this.isAnalysable(path.node.expression)) {
                        splitSSAExpressions(path.node.expression, ssa_asts);
                    } else {
                        return { confident: false };
                    }
                } else if (path.isVariableDeclaration()) {
                    return { confident: false };
                } else {
                    throw new Error(`Not implemented: ${path}`);
                }

                for (let assignment_ast of ssa_asts.slice().reverse()) {
                    if (!this.withConstraint(assignment_ast)) {
                        return { confident: false };
                    }
                }

                const [true_satisfiability, false_satisfiability] = this.checkSatisfiability();
                if (true_satisfiability === 'sat' && false_satisfiability === 'unsat') {
                    return { confident: true, value: true };
                } else if (true_satisfiability === 'unsat' && false_satisfiability === 'sat') {
                    return { confident: true, value: false };
                } else {
                    assert.ok(true_satisfiability === 'sat' && false_satisfiability === 'sat');
                    unknown_variables = this.getUndefinedVariables();
                    bindings = unknown_variables
                        .map(name => current_block.getGraph().for_statement.scope.getBinding(name))
                        .filter((b): b is traverse.Binding => b != null);
                }
            }

            const pred_blocks = current_block.getGraph().getPredecessors(current_block);
            if (pred_blocks.length === 1) {
                current_block = pred_blocks[0];
            } else {
                break;
            }
        }
        return { confident: false };
    }
}

function main() {
    const args_parser = new argparse.ArgumentParser();

    args_parser.add_argument('--line', { help: 'the line number of flatted for loop', required: true, type: 'int' });
    args_parser.add_argument('INFILE', { help: 'obfuscated js file path' });
    args_parser.add_argument('OUTFILE', { help: 'deobfuscated js file path' });

    const args = args_parser.parse_args();
    const program_ast = parser.parse(fs.readFileSync(args.INFILE, { encoding: 'utf-8' }));

    traverse.default(
        program_ast,
        {
            ForStatement(path: traverse.NodePath<types.ForStatement>) {
                if (path.node.loc!.start.line !== args.line) {
                    return;
                }

                let flat_keyname: string;
                let flat_keyvalue: number;

                const for_init = path.get('init');
                const for_test = path.get('test');
                const for_update = path.get('update');
                const for_body = path.get('body');

                // `for` statement's init has the form `var ${flat_keyname} = ${flat_keyvalue}`
                if (for_init.isVariableDeclaration({ kind: 'var' })) {
                    const declarations = for_init.get('declarations');
                    if (declarations.length !== 1) {
                        return;
                    }

                    const declaration_id = declarations[0].get('id');
                    const declaration_init = declarations[0].get('init');

                    if (declaration_id.isIdentifier() && declaration_init.isNumericLiteral()) {
                        flat_keyname = declaration_id.node.name;
                        flat_keyvalue = declaration_init.node.value;
                    } else {
                        return;
                    }
                } else {
                    return;
                }

                // `for` statement's test has the form `void 0 !=== ${flat_keyname}`
                if (for_test.isBinaryExpression({ operator: '!==' })) {
                    const left = for_test.get('left');
                    const right = for_test.get('right');
                    if (left.isUnaryExpression({ operator: 'void' }) && left.get('argument').isNumericLiteral() && right.isIdentifier({ name: flat_keyname })) {
                        // pass
                    } else {
                        return;
                    }
                } else {
                    return;
                }

                // `for` statement's update is null
                if (!for_update.hasNode()) {
                    // pass
                } else {
                    return;
                }

                // `for` statement's body consists with a VariableDeclaration and a SwitchStatement
                if (for_body.isBlockStatement() && for_body.get('body').length === 2) {
                    const body = for_body.get('body');
                    if (!body[0].isVariableDeclaration()) {
                        return;
                    }

                    if (!body[1].isSwitchStatement()) {
                        return;
                    }

                    let graph = new DeflatGraph(path);
                    graph.build();

                    console.log(`[*] number of deflat blocks: ${graph.deflat_blocks.length}`);
                    console.log(`[*] number of forks: ${graph.deflat_blocks.filter(b => b.fork_path != null).length}`);
                    console.log(`[*] number of empty block: ${graph.deflat_blocks.filter(b => b.paths.length === 0 && b.fork_path == null).length}`);

                    while (true) {
                        let count = graph.optimizeBogusFork();
                        console.log(`[*] optimized ${count} bogus fork(s)`);
                        if (count === 0) {
                            break;
                        }
                    }
                    while (true) {
                        let count = graph.optimizeUnreachableBlock();
                        console.log(`[*] optimized ${count} unreachable block(s)`);
                        if (count === 0) {
                            break;
                        }
                    }
                    {
                        let count = graph.optimizeEmptyBlock();
                        console.log(`[*] optimized ${count} empty block(s)`);
                    }

                    // let stream = fs.createWriteStream(`for2-${graph.for_statement.node.loc!.start.line}.txt`);
                    // stream.on('error', err => console.log(`An error occured while writing to the file. Error: ${err.message}`));
                    // stream.on('finish', () => console.log(`done: ${stream.path}`));
                    // stream.write(`number of blocks: ${graph.deflat_blocks.length}\n`);
                    // stream.write(`------------------------------\n`);
                    // graph.deflat_blocks.forEach((b, i) => {
                    //     stream.write(`// ${i}\n`);
                    //     for (let p of b.paths) {
                    //         stream.write(`${p}\n`);
                    //     }
                    //     if (b.fork_path != null) {
                    //         stream.write(`fork_expression: ${b.fork_path}\n`);
                    //     }
                    //     stream.write(`------------------------------\n`);
                    // });
                    // stream.end();

                    // let stream2 = fs.createWriteStream(`fork2-${graph.for_statement.node.loc!.start.line}.txt`);
                    // stream2.on('error', err => console.log(`An error occured while writing to the file. Error: ${err.message}`));
                    // stream2.on('finish', () => console.log(`done: ${stream2.path}`));
                    // graph.deflat_blocks.forEach((b, i) => {
                    //     if (b.fork_path != null) {
                    //         stream2.write(`${i}: ${b.fork_path.toString()}\n`);
                    //     }
                    // });
                    // stream2.end();

                    // let stream3 = fs.createWriteStream(`cfg-${graph.for_statement.node.loc!.start.line}.txt`);
                    // stream3.on('error', err => console.log(`An error occured while writing to the file. Error: ${err.message}`));
                    // stream3.on('finish', () => console.log(`done: ${stream3.path}`));
                    // stream3.write('digraph G {\n');
                    // graph.deflat_blocks.forEach(b => {
                    //     graph.getSuccessors(b).forEach(next_b => stream3.write(`${graph.deflat_blocks.indexOf(b)} -> ${graph.deflat_blocks.indexOf(next_b)}\n`));
                    // });
                    // stream3.write('}\n');
                    // stream3.end();

                    const deobfuscated_ast = graph.generateAst();
                    path.replaceWithMultiple(deobfuscated_ast);

                    path.stop();
                }

                return;
            }
        }
    );

    fs.writeFileSync(args.OUTFILE, generator.default(program_ast).code);
}

if (require.main === module) {
    main();
}
