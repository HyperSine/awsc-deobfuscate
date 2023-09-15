import * as assert from 'node:assert';

import * as ref from 'ref-napi';
import * as ffi from 'ffi-napi';

import {
    libz3
} from './ffi';

interface Z3_symbol extends ref.Pointer<void> {}
interface Z3_literals extends ref.Pointer<void> {}
interface Z3_config extends ref.Pointer<void> {}
interface Z3_context extends ref.Pointer<void> {}
interface Z3_sort extends ref.Pointer<void> {}
interface Z3_func_decl extends ref.Pointer<void> {}
interface Z3_ast extends ref.Pointer<void> {}
interface Z3_app extends ref.Pointer<void> {}
interface Z3_pattern extends ref.Pointer<void> {}
interface Z3_model extends ref.Pointer<void> {}
interface Z3_constructor extends ref.Pointer<void> {}
interface Z3_constructor_list extends ref.Pointer<void> {}
interface Z3_params extends ref.Pointer<void> {}
interface Z3_param_descrs extends ref.Pointer<void> {}
interface Z3_parser_context extends ref.Pointer<void> {}
interface Z3_goal extends ref.Pointer<void> {}
interface Z3_tactic extends ref.Pointer<void> {}
interface Z3_simplifier extends ref.Pointer<void> {}
interface Z3_probe extends ref.Pointer<void> {}
interface Z3_stats extends ref.Pointer<void> {}
interface Z3_solver extends ref.Pointer<void> {}
interface Z3_solver_callback extends ref.Pointer<void> {}
interface Z3_ast_vector extends ref.Pointer<void> {}
interface Z3_ast_map extends ref.Pointer<void> {}
interface Z3_apply_result extends ref.Pointer<void> {}
interface Z3_func_interp extends ref.Pointer<void> {}
interface Z3_func_entry extends ref.Pointer<void> {}
interface Z3_fixedpoint extends ref.Pointer<void> {}
interface Z3_optimize extends ref.Pointer<void> {}
interface Z3_rcf_num extends ref.Pointer<void> {}

enum Z3_lbool {
    Z3_L_FALSE = -1,
    Z3_L_UNDEF = 0,
    Z3_L_TRUE = 1
}

export enum Z3_symbol_kind {
    Z3_INT_SYMBOL = 0,
    Z3_STRING_SYMBOL = 1
}

export enum Z3_parameter_kind {
    Z3_PARAMETER_INT = 0,
    Z3_PARAMETER_DOUBLE = 1,
    Z3_PARAMETER_RATIONAL = 2,
    Z3_PARAMETER_SYMBOL = 3,
    Z3_PARAMETER_SORT = 4,
    Z3_PARAMETER_AST = 5,
    Z3_PARAMETER_FUNC_DECL = 6
}

export enum Z3_sort_kind {
    Z3_UNINTERPRETED_SORT = 0,
    Z3_BOOL_SORT = 1,
    Z3_INT_SORT = 2,
    Z3_REAL_SORT = 3,
    Z3_BV_SORT = 4,
    Z3_ARRAY_SORT = 5,
    Z3_DATATYPE_SORT = 6,
    Z3_RELATION_SORT = 7,
    Z3_FINITE_DOMAIN_SORT = 8,
    Z3_FLOATING_POINT_SORT = 9,
    Z3_ROUNDING_MODE_SORT = 10,
    Z3_SEQ_SORT = 11,
    Z3_RE_SORT = 12,
    Z3_CHAR_SORT = 13,
    Z3_UNKNOWN_SORT = 1000
}

export enum Z3_ast_kind {
    Z3_NUMERAL_AST = 0,
    Z3_APP_AST = 1,
    Z3_VAR_AST = 2,
    Z3_QUANTIFIER_AST = 3,
    Z3_SORT_AST = 4,
    Z3_FUNC_DECL_AST = 5,
    Z3_UNKNOWN_AST = 1000
}

export enum Z3_decl_kind {
    Z3_OP_TRUE = 256,
    Z3_OP_FALSE = 257,
    Z3_OP_EQ = 258,
    Z3_OP_DISTINCT = 259,
    Z3_OP_ITE = 260,
    Z3_OP_AND = 261,
    Z3_OP_OR = 262,
    Z3_OP_IFF = 263,
    Z3_OP_XOR = 264,
    Z3_OP_NOT = 265,
    Z3_OP_IMPLIES = 266,
    Z3_OP_OEQ = 267,
    Z3_OP_ANUM = 512,
    Z3_OP_AGNUM = 513,
    Z3_OP_LE = 514,
    Z3_OP_GE = 515,
    Z3_OP_LT = 516,
    Z3_OP_GT = 517,
    Z3_OP_ADD = 518,
    Z3_OP_SUB = 519,
    Z3_OP_UMINUS = 520,
    Z3_OP_MUL = 521,
    Z3_OP_DIV = 522,
    Z3_OP_IDIV = 523,
    Z3_OP_REM = 524,
    Z3_OP_MOD = 525,
    Z3_OP_TO_REAL = 526,
    Z3_OP_TO_INT = 527,
    Z3_OP_IS_INT = 528,
    Z3_OP_POWER = 529,
    Z3_OP_STORE = 768,
    Z3_OP_SELECT = 769,
    Z3_OP_CONST_ARRAY = 770,
    Z3_OP_ARRAY_MAP = 771,
    Z3_OP_ARRAY_DEFAULT = 772,
    Z3_OP_SET_UNION = 773,
    Z3_OP_SET_INTERSECT = 774,
    Z3_OP_SET_DIFFERENCE = 775,
    Z3_OP_SET_COMPLEMENT = 776,
    Z3_OP_SET_SUBSET = 777,
    Z3_OP_AS_ARRAY = 778,
    Z3_OP_ARRAY_EXT = 779,
    Z3_OP_SET_HAS_SIZE = 780,
    Z3_OP_SET_CARD = 781,
    Z3_OP_BNUM = 1024,
    Z3_OP_BIT1 = 1025,
    Z3_OP_BIT0 = 1026,
    Z3_OP_BNEG = 1027,
    Z3_OP_BADD = 1028,
    Z3_OP_BSUB = 1029,
    Z3_OP_BMUL = 1030,
    Z3_OP_BSDIV = 1031,
    Z3_OP_BUDIV = 1032,
    Z3_OP_BSREM = 1033,
    Z3_OP_BUREM = 1034,
    Z3_OP_BSMOD = 1035,
    Z3_OP_BSDIV0 = 1036,
    Z3_OP_BUDIV0 = 1037,
    Z3_OP_BSREM0 = 1038,
    Z3_OP_BUREM0 = 1039,
    Z3_OP_BSMOD0 = 1040,
    Z3_OP_ULEQ = 1041,
    Z3_OP_SLEQ = 1042,
    Z3_OP_UGEQ = 1043,
    Z3_OP_SGEQ = 1044,
    Z3_OP_ULT = 1045,
    Z3_OP_SLT = 1046,
    Z3_OP_UGT = 1047,
    Z3_OP_SGT = 1048,
    Z3_OP_BAND = 1049,
    Z3_OP_BOR = 1050,
    Z3_OP_BNOT = 1051,
    Z3_OP_BXOR = 1052,
    Z3_OP_BNAND = 1053,
    Z3_OP_BNOR = 1054,
    Z3_OP_BXNOR = 1055,
    Z3_OP_CONCAT = 1056,
    Z3_OP_SIGN_EXT = 1057,
    Z3_OP_ZERO_EXT = 1058,
    Z3_OP_EXTRACT = 1059,
    Z3_OP_REPEAT = 1060,
    Z3_OP_BREDOR = 1061,
    Z3_OP_BREDAND = 1062,
    Z3_OP_BCOMP = 1063,
    Z3_OP_BSHL = 1064,
    Z3_OP_BLSHR = 1065,
    Z3_OP_BASHR = 1066,
    Z3_OP_ROTATE_LEFT = 1067,
    Z3_OP_ROTATE_RIGHT = 1068,
    Z3_OP_EXT_ROTATE_LEFT = 1069,
    Z3_OP_EXT_ROTATE_RIGHT = 1070,
    Z3_OP_BIT2BOOL = 1071,
    Z3_OP_INT2BV = 1072,
    Z3_OP_BV2INT = 1073,
    Z3_OP_CARRY = 1074,
    Z3_OP_XOR3 = 1075,
    Z3_OP_BSMUL_NO_OVFL = 1076,
    Z3_OP_BUMUL_NO_OVFL = 1077,
    Z3_OP_BSMUL_NO_UDFL = 1078,
    Z3_OP_BSDIV_I = 1079,
    Z3_OP_BUDIV_I = 1080,
    Z3_OP_BSREM_I = 1081,
    Z3_OP_BUREM_I = 1082,
    Z3_OP_BSMOD_I = 1083,
    Z3_OP_PR_UNDEF = 1280,
    Z3_OP_PR_TRUE = 1281,
    Z3_OP_PR_ASSERTED = 1282,
    Z3_OP_PR_GOAL = 1283,
    Z3_OP_PR_MODUS_PONENS = 1284,
    Z3_OP_PR_REFLEXIVITY = 1285,
    Z3_OP_PR_SYMMETRY = 1286,
    Z3_OP_PR_TRANSITIVITY = 1287,
    Z3_OP_PR_TRANSITIVITY_STAR = 1288,
    Z3_OP_PR_MONOTONICITY = 1289,
    Z3_OP_PR_QUANT_INTRO = 1290,
    Z3_OP_PR_BIND = 1291,
    Z3_OP_PR_DISTRIBUTIVITY = 1292,
    Z3_OP_PR_AND_ELIM = 1293,
    Z3_OP_PR_NOT_OR_ELIM = 1294,
    Z3_OP_PR_REWRITE = 1295,
    Z3_OP_PR_REWRITE_STAR = 1296,
    Z3_OP_PR_PULL_QUANT = 1297,
    Z3_OP_PR_PUSH_QUANT = 1298,
    Z3_OP_PR_ELIM_UNUSED_VARS = 1299,
    Z3_OP_PR_DER = 1300,
    Z3_OP_PR_QUANT_INST = 1301,
    Z3_OP_PR_HYPOTHESIS = 1302,
    Z3_OP_PR_LEMMA = 1303,
    Z3_OP_PR_UNIT_RESOLUTION = 1304,
    Z3_OP_PR_IFF_TRUE = 1305,
    Z3_OP_PR_IFF_FALSE = 1306,
    Z3_OP_PR_COMMUTATIVITY = 1307,
    Z3_OP_PR_DEF_AXIOM = 1308,
    Z3_OP_PR_ASSUMPTION_ADD = 1309,
    Z3_OP_PR_LEMMA_ADD = 1310,
    Z3_OP_PR_REDUNDANT_DEL = 1311,
    Z3_OP_PR_CLAUSE_TRAIL = 1312,
    Z3_OP_PR_DEF_INTRO = 1313,
    Z3_OP_PR_APPLY_DEF = 1314,
    Z3_OP_PR_IFF_OEQ = 1315,
    Z3_OP_PR_NNF_POS = 1316,
    Z3_OP_PR_NNF_NEG = 1317,
    Z3_OP_PR_SKOLEMIZE = 1318,
    Z3_OP_PR_MODUS_PONENS_OEQ = 1319,
    Z3_OP_PR_TH_LEMMA = 1320,
    Z3_OP_PR_HYPER_RESOLVE = 1321,
    Z3_OP_RA_STORE = 1536,
    Z3_OP_RA_EMPTY = 1537,
    Z3_OP_RA_IS_EMPTY = 1538,
    Z3_OP_RA_JOIN = 1539,
    Z3_OP_RA_UNION = 1540,
    Z3_OP_RA_WIDEN = 1541,
    Z3_OP_RA_PROJECT = 1542,
    Z3_OP_RA_FILTER = 1543,
    Z3_OP_RA_NEGATION_FILTER = 1544,
    Z3_OP_RA_RENAME = 1545,
    Z3_OP_RA_COMPLEMENT = 1546,
    Z3_OP_RA_SELECT = 1547,
    Z3_OP_RA_CLONE = 1548,
    Z3_OP_FD_CONSTANT = 1549,
    Z3_OP_FD_LT = 1550,
    Z3_OP_SEQ_UNIT = 1551,
    Z3_OP_SEQ_EMPTY = 1552,
    Z3_OP_SEQ_CONCAT = 1553,
    Z3_OP_SEQ_PREFIX = 1554,
    Z3_OP_SEQ_SUFFIX = 1555,
    Z3_OP_SEQ_CONTAINS = 1556,
    Z3_OP_SEQ_EXTRACT = 1557,
    Z3_OP_SEQ_REPLACE = 1558,
    Z3_OP_SEQ_REPLACE_RE = 1559,
    Z3_OP_SEQ_REPLACE_RE_ALL = 1560,
    Z3_OP_SEQ_REPLACE_ALL = 1561,
    Z3_OP_SEQ_AT = 1562,
    Z3_OP_SEQ_NTH = 1563,
    Z3_OP_SEQ_LENGTH = 1564,
    Z3_OP_SEQ_INDEX = 1565,
    Z3_OP_SEQ_LAST_INDEX = 1566,
    Z3_OP_SEQ_TO_RE = 1567,
    Z3_OP_SEQ_IN_RE = 1568,
    Z3_OP_STR_TO_INT = 1569,
    Z3_OP_INT_TO_STR = 1570,
    Z3_OP_UBV_TO_STR = 1571,
    Z3_OP_SBV_TO_STR = 1572,
    Z3_OP_STR_TO_CODE = 1573,
    Z3_OP_STR_FROM_CODE = 1574,
    Z3_OP_STRING_LT = 1575,
    Z3_OP_STRING_LE = 1576,
    Z3_OP_RE_PLUS = 1577,
    Z3_OP_RE_STAR = 1578,
    Z3_OP_RE_OPTION = 1579,
    Z3_OP_RE_CONCAT = 1580,
    Z3_OP_RE_UNION = 1581,
    Z3_OP_RE_RANGE = 1582,
    Z3_OP_RE_DIFF = 1583,
    Z3_OP_RE_INTERSECT = 1584,
    Z3_OP_RE_LOOP = 1585,
    Z3_OP_RE_POWER = 1586,
    Z3_OP_RE_COMPLEMENT = 1587,
    Z3_OP_RE_EMPTY_SET = 1588,
    Z3_OP_RE_FULL_SET = 1589,
    Z3_OP_RE_FULL_CHAR_SET = 1590,
    Z3_OP_RE_OF_PRED = 1591,
    Z3_OP_RE_REVERSE = 1592,
    Z3_OP_RE_DERIVATIVE = 1593,
    Z3_OP_CHAR_CONST = 1594,
    Z3_OP_CHAR_LE = 1595,
    Z3_OP_CHAR_TO_INT = 1596,
    Z3_OP_CHAR_TO_BV = 1597,
    Z3_OP_CHAR_FROM_BV = 1598,
    Z3_OP_CHAR_IS_DIGIT = 1599,
    Z3_OP_LABEL = 1792,
    Z3_OP_LABEL_LIT = 1793,
    Z3_OP_DT_CONSTRUCTOR = 2048,
    Z3_OP_DT_RECOGNISER = 2049,
    Z3_OP_DT_IS = 2050,
    Z3_OP_DT_ACCESSOR = 2051,
    Z3_OP_DT_UPDATE_FIELD = 2052,
    Z3_OP_PB_AT_MOST = 2304,
    Z3_OP_PB_AT_LEAST = 2305,
    Z3_OP_PB_LE = 2306,
    Z3_OP_PB_GE = 2307,
    Z3_OP_PB_EQ = 2308,
    Z3_OP_SPECIAL_RELATION_LO = 40960,
    Z3_OP_SPECIAL_RELATION_PO = 40961,
    Z3_OP_SPECIAL_RELATION_PLO = 40962,
    Z3_OP_SPECIAL_RELATION_TO = 40963,
    Z3_OP_SPECIAL_RELATION_TC = 40964,
    Z3_OP_SPECIAL_RELATION_TRC = 40965,
    Z3_OP_FPA_RM_NEAREST_TIES_TO_EVEN = 45056,
    Z3_OP_FPA_RM_NEAREST_TIES_TO_AWAY = 45057,
    Z3_OP_FPA_RM_TOWARD_POSITIVE = 45058,
    Z3_OP_FPA_RM_TOWARD_NEGATIVE = 45059,
    Z3_OP_FPA_RM_TOWARD_ZERO = 45060,
    Z3_OP_FPA_NUM = 45061,
    Z3_OP_FPA_PLUS_INF = 45062,
    Z3_OP_FPA_MINUS_INF = 45063,
    Z3_OP_FPA_NAN = 45064,
    Z3_OP_FPA_PLUS_ZERO = 45065,
    Z3_OP_FPA_MINUS_ZERO = 45066,
    Z3_OP_FPA_ADD = 45067,
    Z3_OP_FPA_SUB = 45068,
    Z3_OP_FPA_NEG = 45069,
    Z3_OP_FPA_MUL = 45070,
    Z3_OP_FPA_DIV = 45071,
    Z3_OP_FPA_REM = 45072,
    Z3_OP_FPA_ABS = 45073,
    Z3_OP_FPA_MIN = 45074,
    Z3_OP_FPA_MAX = 45075,
    Z3_OP_FPA_FMA = 45076,
    Z3_OP_FPA_SQRT = 45077,
    Z3_OP_FPA_ROUND_TO_INTEGRAL = 45078,
    Z3_OP_FPA_EQ = 45079,
    Z3_OP_FPA_LT = 45080,
    Z3_OP_FPA_GT = 45081,
    Z3_OP_FPA_LE = 45082,
    Z3_OP_FPA_GE = 45083,
    Z3_OP_FPA_IS_NAN = 45084,
    Z3_OP_FPA_IS_INF = 45085,
    Z3_OP_FPA_IS_ZERO = 45086,
    Z3_OP_FPA_IS_NORMAL = 45087,
    Z3_OP_FPA_IS_SUBNORMAL = 45088,
    Z3_OP_FPA_IS_NEGATIVE = 45089,
    Z3_OP_FPA_IS_POSITIVE = 45090,
    Z3_OP_FPA_FP = 45091,
    Z3_OP_FPA_TO_FP = 45092,
    Z3_OP_FPA_TO_FP_UNSIGNED = 45093,
    Z3_OP_FPA_TO_UBV = 45094,
    Z3_OP_FPA_TO_SBV = 45095,
    Z3_OP_FPA_TO_REAL = 45096,
    Z3_OP_FPA_TO_IEEE_BV = 45097,
    Z3_OP_FPA_BVWRAP = 45098,
    Z3_OP_FPA_BV2RM = 45099,
    Z3_OP_INTERNAL = 45100,
    Z3_OP_RECURSIVE = 45101,
    Z3_OP_UNINTERPRETED = 45102
}

export enum Z3_param_kind {
    Z3_PK_UINT = 0,
    Z3_PK_BOOL = 1,
    Z3_PK_DOUBLE = 2,
    Z3_PK_SYMBOL = 3,
    Z3_PK_STRING = 4,
    Z3_PK_OTHER = 5,
    Z3_PK_INVALID = 6
}

enum Z3_ast_print_mode {
    Z3_PRINT_SMTLIB_FULL = 0,
    Z3_PRINT_LOW_LEVEL = 1,
    Z3_PRINT_SMTLIB2_COMPLIANT = 2
}

enum Z3_error_code {
    Z3_OK = 0,
    Z3_SORT_ERROR = 1,
    Z3_IOB = 2,
    Z3_INVALID_ARG = 3,
    Z3_PARSER_ERROR = 4,
    Z3_NO_PARSER = 5,
    Z3_INVALID_PATTERN = 6,
    Z3_MEMOUT_FAIL = 7,
    Z3_FILE_ACCESS_ERROR = 8,
    Z3_INTERNAL_FATAL = 9,
    Z3_INVALID_USAGE = 10,
    Z3_DEC_REF_ERROR = 11,
    Z3_EXCEPTION = 12
}

export enum Z3_goal_prec {
    Z3_GOAL_PRECISE = 0,
    Z3_GOAL_UNDER = 1,
    Z3_GOAL_OVER = 2,
    Z3_GOAL_UNDER_OVER = 3
}

const cleanup = new FinalizationRegistry<() => void>(callback => callback());
const default_eh = ffi.Callback('void', ['void*', 'int'], (z3_ctx: ref.Pointer<void>, ec: Z3_error_code) => {});

export class Z3Error extends Error {}

export type CheckSatResult = 'sat' | 'unsat' | 'unknown';

export function enableTrace(tag: string) {
    libz3.Z3_enable_trace(tag);
}

export function disableTrace(tag: string) {
    libz3.Z3_disable_trace(tag);
}

export function getVersion(): { major: number; minor: number; build_number: number; revision_number: number } {
    let major = ref.alloc('uint');
    let minor = ref.alloc('uint');
    let build_number = ref.alloc('uint');
    let revision_number = ref.alloc('uint');

    libz3.Z3_get_version(major, minor, build_number, revision_number);

    return {
        major: major.deref(),
        minor: minor.deref(),
        build_number: build_number.deref(),
        revision_number: revision_number.deref()
    };
}

export function getVersionString(): string {
    const { major, minor, build_number } = getVersion();
    return `${major}.${minor}.${build_number}`;
}

export function getFullVersion(): string {
    return libz3.Z3_get_full_version()!;
}

export function openLog(filename: string): boolean {
    return libz3.Z3_open_log(filename);
}

export function appendLog(s: string) {
    libz3.Z3_append_log(s);
}

export function closeLog() {
    libz3.Z3_close_log();
}

export function setParam(key: string, value: boolean | number | string): void;

export function setParam(params: Record<string, boolean | number | string>): void;

export function setParam(key: string | Record<string, boolean | number | string>, value?: boolean | number | string) {
    if (typeof key === 'string') {
        assert.ok(value !== undefined);
        libz3.Z3_global_param_set(key, typeof value === 'string' ? value : value.toString());
    } else {
        assert.ok(value === undefined, "Can't provide a Record and second parameter to setParam at the same time");
        for (let [k, v] of Object.entries(key)) {
            libz3.Z3_global_param_set(k, typeof v === 'string' ? v : v.toString());
        }
    }
}

export function resetParams() {
    libz3.Z3_global_param_reset_all();
}

export function getParam(name: string): string | null {
    let str = ref.alloc('CString');
    return libz3.Z3_global_param_get(name, str) ? str.deref() : null;
}

export class Context {
    readonly ptr: Z3_context;

    readonly Symbol: {
        new: (value: number | string) => Symbol;
    }

    readonly Params: {
        new: (options?: Record<string, boolean | number | string>) => Params
    }

    readonly Sort: {
        declare: (name: string) => Sort;
    }

    readonly Bool: {
        sort: () => BoolSort;
        const: (name: string) => Bool;
        consts: (names: string | string[]) => Bool[];
        val: (value: boolean) => Bool;
    }

    readonly Int: {
        sort: () => ArithSort;
        const: (name: string) => Arith;
        consts: (names: string | string[]) => Arith[];
        val: (value: number | bigint | string) => IntNum;
    }

    readonly Real: {
        sort: () => ArithSort;
        const: (name: string) => Arith;
        consts: (names: string | string[]) => Arith[];
        val: (value: number | bigint | string) => RatNum;
    }

    readonly BitVec: {
        sort: <Bits extends number>(bits: Bits) => BitVecSort<Bits>;
        const: <Bits extends number>(name: string, bits: Bits) => BitVec<Bits>;
        consts: <Bits extends number>(names: string | string[], bits: Bits) => BitVec<Bits>[];
        val: <Bits extends number>(value: boolean | number | bigint, bits: Bits) => BitVecNum<Bits>;
    }

    readonly Solver: {
        new: () => Solver;
    }

    constructor(options?: Record<string, boolean | number | string>) {
        const z3_cfg = libz3.Z3_mk_config();
        if (options != null) {
            for (const [k, v] of Object.entries(options)) {
                libz3.Z3_set_param_value(z3_cfg, k, typeof v === 'string' ? v : v.toString());
            }
        }

        const z3_ctx = libz3.Z3_mk_context_rc(z3_cfg);

        this.ptr = z3_ctx;
        cleanup.register(this, () => libz3.Z3_del_context(z3_ctx));

        this.check(libz3.Z3_set_error_handler(z3_ctx, default_eh));
        this.check(libz3.Z3_set_ast_print_mode(z3_ctx, Z3_ast_print_mode.Z3_PRINT_SMTLIB2_COMPLIANT));
        this.check(libz3.Z3_del_config(z3_cfg));

        // use weakref to avoid circular reference
        const weak_ctx = new WeakRef(this);
        this.Symbol = {
            new(value: number | string): Symbol {
                const ctx = weak_ctx.deref()!;
                if (typeof value === 'number') {
                    return new Symbol(ctx, ctx.check(libz3.Z3_mk_int_symbol(ctx.ptr, value)));
                } else {
                    return new Symbol(ctx, ctx.check(libz3.Z3_mk_string_symbol(ctx.ptr, value)));
                }
            }
        };
        this.Params = {
            new(options?: Record<string, boolean | number | string>): Params {
                const ctx = weak_ctx.deref()!;

                const params = new Params(ctx, ctx.check(libz3.Z3_mk_params(ctx.ptr)));
                if (options != null) {
                    for (const [param_name, param_value] of Object.entries(options)) {
                        params.set(param_name, param_value);
                    }
                }

                return params;
            }
        };
        this.Sort = {
            declare(name: string): Sort {
                const ctx = weak_ctx.deref()!;
                const symbol = ctx.Symbol.new(name);
                return new Sort(ctx, ctx.check(libz3.Z3_mk_uninterpreted_sort(ctx.ptr, symbol.ptr)));
            }
        }
        this.Bool = {
            sort(): BoolSort {
                const ctx = weak_ctx.deref()!;
                return new BoolSort(ctx, ctx.check(libz3.Z3_mk_bool_sort(ctx.ptr)));
            },
            const(name: string): Bool {
                const ctx = weak_ctx.deref()!;
                const z3_symbol = ctx.check(libz3.Z3_mk_string_symbol(ctx.ptr, name));
                const bool_sort = this.sort();
                return new Bool(ctx, ctx.check(libz3.Z3_mk_const(ctx.ptr, z3_symbol, bool_sort.ptr)));
            },
            consts(names: string | string[]): Bool[] {
                if (typeof names === 'string') {
                    names = names.split(' ').filter(name => name.length !== 0);
                }
                return names.map(name => this.const(name));
            },
            val(value: boolean): Bool {
                const ctx = weak_ctx.deref()!;
                return new Bool(ctx, ctx.check(value ? libz3.Z3_mk_true(ctx.ptr) : libz3.Z3_mk_true(ctx.ptr)));
            },
        }
        this.Int = {
            sort(): ArithSort {
                const ctx = weak_ctx.deref()!;
                return new ArithSort(ctx, ctx.check(libz3.Z3_mk_int_sort(ctx.ptr)));
            },
            const(name: string): Arith {
                const ctx = weak_ctx.deref()!;
                const z3_symbol = ctx.check(libz3.Z3_mk_string_symbol(ctx.ptr, name));
                const int_sort = this.sort();
                return new Arith(ctx, ctx.check(libz3.Z3_mk_const(ctx.ptr, z3_symbol, int_sort.ptr)));
            },
            consts(names: string | string[]): Arith[] {
                if (typeof names === 'string') {
                    names = names.split(' ').filter(name => name.length !== 0);
                }
                return names.map(name => this.const(name));
            },
            val(value: number | bigint | string): IntNum {
                assert.ok(typeof value === 'number' && Number.isSafeInteger(value) || typeof value === 'bigint' || typeof value === 'string');
                const ctx = weak_ctx.deref()!;
                const int_sort = this.sort();
                return new IntNum(ctx, ctx.check(libz3.Z3_mk_numeral(ctx.ptr, value.toString(), int_sort.ptr)));
            },
        };
        this.Real = {
            sort(): ArithSort {
                const ctx = weak_ctx.deref()!;
                return new ArithSort(ctx, ctx.check(libz3.Z3_mk_real_sort(ctx.ptr)));
            },
            const(name: string): Arith {
                const ctx = weak_ctx.deref()!;
                const z3_symbol = ctx.check(libz3.Z3_mk_string_symbol(ctx.ptr, name));
                const real_sort = this.sort();
                return new Arith(ctx, ctx.check(libz3.Z3_mk_const(ctx.ptr, z3_symbol, real_sort.ptr)));
            },
            consts(names: string | string[]): Arith[] {
                if (typeof names === 'string') {
                    names = names.split(' ').filter(name => name.length !== 0);
                }
                return names.map(name => this.const(name));
            },
            val(value: number | bigint | string): RatNum {
                const ctx = weak_ctx.deref()!;
                const real_sort = this.sort();
                return new RatNum(ctx, ctx.check(libz3.Z3_mk_numeral(ctx.ptr, value.toString(), real_sort.ptr)));
            }
        };
        this.BitVec = {
            sort<Bits extends number>(bits: Bits): BitVecSort<Bits> {
                assert.ok(Number.isSafeInteger(bits), 'number of bits must be an integer');
                const ctx = weak_ctx.deref()!;
                return new BitVecSort(ctx, ctx.check(libz3.Z3_mk_bv_sort(ctx.ptr, bits)));
            },
            const<Bits extends number>(name: string, bits: Bits): BitVec<Bits> {
                const ctx = weak_ctx.deref()!;
                const z3_symbol = ctx.check(libz3.Z3_mk_string_symbol(ctx.ptr, name));
                const bv_sort = this.sort(bits);
                return new BitVec(ctx, ctx.check(libz3.Z3_mk_const(ctx.ptr, z3_symbol, bv_sort.ptr)));
            },
            consts<Bits extends number>(names: string | string[], bits: Bits): BitVec<Bits>[] {
                if (typeof names === 'string') {
                    names = names.split(' ').filter(name => name.length !== 0);
                }
                return names.map(name => this.const(name, bits));
            },
            val<Bits extends number>(value: boolean | number | bigint, bits: Bits): BitVecNum<Bits> {
                if (typeof value === 'boolean') {
                    value = value ? 1 : 0;
                }
                const ctx = weak_ctx.deref()!;
                const bv_sort = this.sort(bits);
                return new BitVecNum(ctx, ctx.check(libz3.Z3_mk_numeral(ctx.ptr, value.toString(), bv_sort.ptr)));
            }
        };
        this.Solver = {
            new(): Solver {
                const ctx = weak_ctx.deref()!;
                return new Solver(ctx, libz3.Z3_mk_solver(ctx.ptr));
            }
        };
    }

    throwIfError() {
        const ec = libz3.Z3_get_error_code(this.ptr);
        if (ec !== Z3_error_code.Z3_OK) {
            throw new Z3Error(libz3.Z3_get_error_msg(this.ptr, ec)!);
        }
    }

    check<T>(val: T): T {
        this.throwIfError();
        return val;
    }

    interrupt() {
        this.check(libz3.Z3_interrupt(this.ptr));
    }

    getParamDescrs(): ParamDescrs {
        return new ParamDescrs(this, this.check(libz3.Z3_get_global_param_descrs(this.ptr)));
    }
}

function assertContext(...objs: (Context | { ctx: Context })[]) {
    objs.reduce((a, b) => (assert.strictEqual('ctx' in a ? a.ctx : a, 'ctx' in b ? b.ctx : b, 'Context mismatch'), b));
}

export class Symbol {
    readonly ctx: Context;
    readonly ptr: Z3_symbol;

    constructor(ctx: Context, ptr: Z3_symbol) {
        this.ctx = ctx;
        this.ptr = ptr;
    }

    kind(): Z3_symbol_kind {
        return this.ctx.check(libz3.Z3_get_symbol_kind(this.ctx.ptr, this.ptr));
    }

    value(): number | string {
        if (this.kind() === Z3_symbol_kind.Z3_INT_SYMBOL) {
            return this.ctx.check(libz3.Z3_get_symbol_int(this.ctx.ptr, this.ptr));
        } else {
            return this.ctx.check(libz3.Z3_get_symbol_string(this.ctx.ptr, this.ptr))!;
        }
    }

    toString(): string {
        if (this.kind() === Z3_symbol_kind.Z3_INT_SYMBOL) {
            const val = this.ctx.check(libz3.Z3_get_symbol_int(this.ctx.ptr, this.ptr));
            return `k!${val}`;
        } else {
            return this.ctx.check(libz3.Z3_get_symbol_string(this.ctx.ptr, this.ptr))!;
        }
    }
}

export class Params {
    readonly ctx: Context;
    readonly ptr: Z3_params;

    constructor(ctx: Context, ptr: Z3_params) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_params_inc_ref(ctx.ptr, ptr);
        cleanup.register(this, () => libz3.Z3_params_dec_ref(z3_ctx, ptr));
    }

    set(key: string, value: boolean | number | string) {
        const symbol_k = this.ctx.Symbol.new(key);
        if (typeof value === 'boolean') {
            this.ctx.check(libz3.Z3_params_set_bool(this.ctx.ptr, this.ptr, symbol_k.ptr, value));
        } else if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                this.ctx.check(libz3.Z3_params_set_uint(this.ctx.ptr, this.ptr, symbol_k.ptr, value));
            } else {
                this.ctx.check(libz3.Z3_params_set_double(this.ctx.ptr, this.ptr, symbol_k.ptr, value));
            }
        } else {
            const symbol_v = this.ctx.Symbol.new(value);
            this.ctx.check(libz3.Z3_params_set_symbol(this.ctx.ptr, this.ptr, symbol_k.ptr, symbol_v.ptr));
        }
    }

    toString(): string {
        return libz3.Z3_params_to_string(this.ctx.ptr, this.ptr)!;
    }
}

export class ParamDescrs {
    readonly ctx: Context;
    readonly ptr: Z3_param_descrs;

    constructor(ctx: Context, ptr: Z3_param_descrs) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_param_descrs_inc_ref(ctx.ptr, ptr);
        cleanup.register(this, () => libz3.Z3_param_descrs_dec_ref(z3_ctx, ptr));
    }

    size(): number {
        return libz3.Z3_param_descrs_size(this.ctx.ptr, this.ptr);
    }

    toString(): string {
        return this.ctx.check(libz3.Z3_param_descrs_to_string(this.ctx.ptr, this.ptr))!;
    }
}

export class Ast<Ptr = unknown> {
    readonly ctx: Context;
    readonly ptr: Ptr;

    constructor(ctx: Context, ptr: Ptr) {
        this.ctx = ctx;
        this.ptr = ptr;

        const z3_ctx = ctx.ptr;
        const z3_ast = this.ast_ptr;

        libz3.Z3_inc_ref(z3_ctx, z3_ast);
        cleanup.register(this, () => libz3.Z3_dec_ref(z3_ctx, z3_ast));
    }

    get ast_ptr(): Z3_ast {
        return this.ptr as Z3_ast;
    }

    id(): number {
        const z3_ast = this.ast_ptr;
        return libz3.Z3_get_ast_id(this.ctx.ptr, z3_ast);
    }

    hash(): number {
        const z3_ast = this.ast_ptr;
        return libz3.Z3_get_ast_hash(this.ctx.ptr, z3_ast);
    }

    eqIdentity(other: Ast): boolean {
        assertContext(this, other);
        const a = this.ast_ptr;
        const b = this.ast_ptr;
        return this.ctx.check(libz3.Z3_is_eq_ast(this.ctx.ptr, a, b));
    }

    neqIdentity(other: Ast): boolean {
        return !this.eqIdentity(other);
    }

    toString(): string {
        const z3_ast = this.ast_ptr;
        return libz3.Z3_ast_to_string(this.ctx.ptr, z3_ast)!;
    }
}

export class Sort extends Ast<Z3_sort> {
    override get ast_ptr(): Z3_ast {
        return libz3.Z3_sort_to_ast(this.ctx.ptr, this.ptr);
    }

    kind(): Z3_sort_kind {
        return this.ctx.check(libz3.Z3_get_sort_kind(this.ctx.ptr, this.ptr));
    }

    name(): string {
        const z3_symbol = this.ctx.check(libz3.Z3_get_sort_name(this.ctx.ptr, this.ptr));
        return new Symbol(this.ctx, z3_symbol).toString();
    }

    subsort(other: Sort): boolean {
        assertContext(this, other);
        return false;
    }

    cast(expr: Expr): Expr {
        assertContext(this, expr);
        assert.ok(expr.sort().eqIdentity(expr.sort()), 'Sort mismatch');
        return expr;
    }

    eqIdentity(other: Sort): boolean {
        assertContext(this, other);
        const a = this.ast_ptr;
        const b = this.ast_ptr;
        return this.ctx.check(libz3.Z3_is_eq_sort(this.ctx.ptr, a, b));
    }

    neqIdentity(other: Sort): boolean {
        return !this.eqIdentity(other);
    }
}

export class FuncDecl extends Ast<Z3_func_decl> {
    override get ast_ptr(): Z3_ast {
        return libz3.Z3_func_decl_to_ast(this.ctx.ptr, this.ptr);
    }

    kind(): Z3_decl_kind {
        return this.ctx.check(libz3.Z3_get_decl_kind(this.ctx.ptr, this.ptr));
    }

    name(): string {
        const z3_symbol = this.ctx.check(libz3.Z3_get_decl_name(this.ctx.ptr, this.ptr));
        return new Symbol(this.ctx, z3_symbol).toString();
    }

    arity(): number {
        return this.ctx.check(libz3.Z3_get_arity(this.ctx.ptr, this.ptr));
    }

    domain(i: number): AnySort {
        const z3_domain_sort = this.ctx.check(libz3.Z3_get_domain(this.ctx.ptr, this.ptr, i));
        return makeSort(this.ctx, z3_domain_sort);
    }

    range(): AnySort {
        const z3_domain_sort = this.ctx.check(libz3.Z3_get_range(this.ctx.ptr, this.ptr));
        return makeSort(this.ctx, z3_domain_sort);
    }

    // todo: params
}

export class AstVector<I extends AnyAst> {
    readonly ctx: Context;
    readonly ptr: Z3_ast_vector;

    constructor(ctx: Context, ptr: Z3_ast_vector) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_ast_vector_inc_ref(z3_ctx, ptr);
        cleanup.register(this, () => libz3.Z3_ast_vector_dec_ref(z3_ctx, ptr));
    }

    push(item: I) {
        const z3_ast = item.ast_ptr;
        this.ctx.check(libz3.Z3_ast_vector_push(this.ctx.ptr, this.ptr, z3_ast));
    }

    size(): number {
        return this.ctx.check(libz3.Z3_ast_vector_size(this.ctx.ptr, this.ptr));
    }

    resize(s: number) {
        this.ctx.check(libz3.Z3_ast_vector_resize(this.ctx.ptr, this.ptr, s));
    }

    toString(): string {
        return this.ctx.check(libz3.Z3_ast_vector_to_string(this.ctx.ptr, this.ptr))!;
    }
}

export class AstMap<K extends AnyAst, V extends AnyAst> {
    readonly ctx: Context;
    readonly ptr: Z3_ast_map;

    constructor(ctx: Context, ptr: Z3_ast_map) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_ast_map_inc_ref(z3_ctx, ptr);
        cleanup.register(this, () => libz3.Z3_ast_map_dec_ref(z3_ctx, ptr));
    }
}

export class Expr<S extends Sort = AnySort> extends Ast<Z3_ast> {
    sort(): S {
        const z3_sort = this.ctx.check(libz3.Z3_get_sort(this.ctx.ptr, this.ptr));
        return makeSort(this.ctx, z3_sort) as S;
    }

    eq(other: Expr): Bool {
        const z3_ast = this.ctx.check(libz3.Z3_mk_eq(this.ctx.ptr, this.ptr, other.ptr));
        return new Bool(this.ctx, z3_ast);
    }

    neq(other: Expr): Bool {
        const z3_asts = Buffer.alloc(ref.sizeof.pointer * 2) as ref.Pointer<Z3_ast>;

        ref.writePointer(z3_asts, 0, this.ptr);
        ref.writePointer(z3_asts, ref.sizeof.pointer, other.ptr);

        const z3_ast_retval = this.ctx.check(libz3.Z3_mk_distinct(this.ctx.ptr, 2, z3_asts));
        return new Bool(this.ctx, z3_ast_retval);
    }

    decl(): FuncDecl {
        assert.ok(isApp(this), 'Z3 application expected');
        const z3_app = this.ctx.check(libz3.Z3_to_app(this.ctx.ptr, this.ptr));
        return new FuncDecl(this.ctx, this.ctx.check(libz3.Z3_get_app_decl(this.ctx.ptr, z3_app)));
    }

    numArgs(): number {
        assert.ok(isApp(this), 'Z3 application expected');
        const z3_app = this.ctx.check(libz3.Z3_to_app(this.ctx.ptr, this.ptr));
        return this.ctx.check(libz3.Z3_get_app_num_args(this.ctx.ptr, z3_app));
    }
}

export class BoolSort extends Sort {
    cast(other: Bool): Bool;

    cast(other: boolean): Bool;

    cast(other: Bool | boolean): Bool {
        if (typeof other === 'boolean') {
            return this.ctx.Bool.val(other);
        } else {
            assert.ok(isExpr(other), 'true, false or Z3 Boolean expression expected');
            assert.ok(this.eqIdentity(other.sort()), 'Value cannot be converted into a Z3 Boolean value');
            return other;
        }
    }

    subsort(other: Sort): boolean {
        return other instanceof ArithSort;
    }
}

export class Bool extends Expr<BoolSort> {
    not(): Bool {
        return Not(this);
    }

    and(other: Bool | boolean): Bool {
        if (typeof other === 'boolean') {
            other = this.ctx.Bool.val(other);
        }
        return And(this, other);
    }

    or(other: Bool | boolean): Bool {
        if (typeof other === 'boolean') {
            other = this.ctx.Bool.val(other);
        }
        return Or(this, other);
    }

    xor(other: Bool | boolean): Bool {
        if (typeof other === 'boolean') {
            other = this.ctx.Bool.val(other);
        }
        return Xor(this, other);
    }

    implies(other: Bool | boolean): Bool {
        if (typeof other === 'boolean') {
            other = this.ctx.Bool.val(other);
        }
        return Implies(this, other);
    }

    iff(other: Bool | boolean): Bool {
        if (typeof other === 'boolean') {
            other = this.ctx.Bool.val(other);
        }
        return Iff(this, other);
    }
}

export class Quantifier extends Bool {
    body(): AnyExpr {
        const z3_ast = this.ctx.check(libz3.Z3_get_quantifier_body(this.ctx.ptr, this.ptr));
        return makeExpr(this.ctx, z3_ast);
    }

    weight(): number {
        return this.ctx.check(libz3.Z3_get_quantifier_weight(this.ctx.ptr, this.ptr));
    }

    // todo getPattern()
    // todo getNoPattern()

    numPatterns(): number {
        return this.ctx.check(libz3.Z3_get_quantifier_num_patterns(this.ctx.ptr, this.ptr));
    }

    numNoPatterns(): number {
        return this.ctx.check(libz3.Z3_get_quantifier_num_no_patterns(this.ctx.ptr, this.ptr));
    }

    isLambda(): boolean {
        return this.ctx.check(libz3.Z3_is_lambda(this.ctx.ptr, this.ptr));
    }
}

export class ArithSort extends Sort {

}

export class Arith extends Expr<ArithSort> {
    neg(): Arith {
        return Neg(this);
    }

    add(other: Arith): Arith {
        return Add(this, other);
    }

    sub(other: Arith): Arith {
        return Sub(this, other);
    }

    mul(other: Arith): Arith {
        return Mul(this, other);
    }

    div(other: Arith): Arith {
        return Div(this, other);
    }

    mod(other: Arith): Arith {
        return Mod(this, other);
    }

    lt(other: Arith): Bool {
        return LT(this, other);
    }

    le(other: Arith): Bool {
        return LE(this, other);
    }

    gt(other: Arith): Bool {
        return GT(this, other);
    }

    ge(other: Arith): Bool {
        return GE(this, other);
    }
}

export class IntNum extends Arith {
    value(): bigint {
        return BigInt(this.toNumeralString());
    }

    toNumeralString(): string {
        return this.ctx.check(libz3.Z3_get_numeral_string(this.ctx.ptr, this.ptr))!;
    }

    toNumeralBinaryString(): string {
        return this.ctx.check(libz3.Z3_get_numeral_binary_string(this.ctx.ptr, this.ptr))!;
    }
}

export class RatNum extends Arith {
    value(): { numerator: bigint, denominator: bigint } {
        return { numerator: this.numerator().value(), denominator: this.denominator().value() };
    }

    numerator(): IntNum {
        const z3_ast = this.ctx.check(libz3.Z3_get_numerator(this.ctx.ptr, this.ptr));
        return new IntNum(this.ctx, z3_ast);
    }

    denominator(): IntNum {
        const z3_ast = this.ctx.check(libz3.Z3_get_denominator(this.ctx.ptr, this.ptr));
        return new IntNum(this.ctx, z3_ast);
    }

    toNumeralString(): string {
        return this.ctx.check(libz3.Z3_get_numeral_string(this.ctx.ptr, this.ptr))!;
    }

    toNumeralDecimalString(prec: number): string {
        return this.ctx.check(libz3.Z3_get_numeral_decimal_string(this.ctx.ptr, this.ptr, prec))!;
    }
}

export class AlgebraicNum extends Arith {

}

export class BitVecSort<Bits extends number> extends Sort {
    size(): Bits {
        return this.ctx.check(libz3.Z3_get_bv_sort_size(this.ctx.ptr, this.ptr)) as Bits;
    }

    subsort(other: Sort): boolean {
        return other instanceof BitVecSort && this.size() < other.size();
    }
}

export class BitVec<Bits extends number> extends Expr<BitVecSort<Bits>> {
    size(): number {
        return this.sort().size();
    }

    add(other: BitVec<Bits>): BitVec<Bits> {
        return BVAdd(this, other);
    }

    sub(other: BitVec<Bits>): BitVec<Bits> {
        return BVSub(this, other);
    }

    mul(other: BitVec<Bits>): BitVec<Bits> {
        return BVMul(this, other);
    }

    sdiv(other: BitVec<Bits>): BitVec<Bits> {
        return BVSDiv(this, other);
    }

    srem(other: BitVec<Bits>): BitVec<Bits> {
        return BVSRem(this, other);
    }

    smod(other: BitVec<Bits>): BitVec<Bits> {
        return BVSMod(this, other);
    }

    udiv(other: BitVec<Bits>): BitVec<Bits> {
        return BVUDiv(this, other);
    }

    urem(other: BitVec<Bits>): BitVec<Bits> {
        return BVURem(this, other);
    }

    neg(): BitVec<Bits> {
        return BVNeg(this);
    }

    and(other: BitVec<Bits>): BitVec<Bits> {
        return BVAnd(this, other);
    }

    or(other: BitVec<Bits>): BitVec<Bits> {
        return BVOr(this, other);
    }

    xor(other: BitVec<Bits>): BitVec<Bits> {
        return BVXor(this, other);
    }

    not(): BitVec<Bits> {
        return BVNot(this);
    }

    nand(other: BitVec<Bits>): BitVec<Bits> {
        return BVNand(this, other);
    }

    nor(other: BitVec<Bits>): BitVec<Bits> {
        return BVNor(this, other);
    }

    xnor(other: BitVec<Bits>): BitVec<Bits> {
        return BVXnor(this, other);
    }

    shl(other: BitVec<Bits>): BitVec<Bits> {
        return BVShl(this, other);
    }

    ashr(other: BitVec<Bits>): BitVec<Bits> {
        return BVAShr(this, other);
    }

    lshr(other: BitVec<Bits>): BitVec<Bits> {
        return BVLShr(this, other);
    }

    slt(other: BitVec<Bits>): Bool {
        return SLT(this, other);
    }

    sle(other: BitVec<Bits>): Bool {
        return SLE(this, other);
    }

    sgt(other: BitVec<Bits>): Bool {
        return SGT(this, other);
    }

    sge(other: BitVec<Bits>): Bool {
        return SGE(this, other);
    }

    ult(other: BitVec<Bits>): Bool {
        return ULT(this, other);
    }

    ule(other: BitVec<Bits>): Bool {
        return ULE(this, other);
    }

    ugt(other: BitVec<Bits>): Bool {
        return UGT(this, other);
    }

    uge(other: BitVec<Bits>): Bool {
        return UGE(this, other);
    }

    extract(high: number, low: number): BitVec<number> {
        return Extract(high, low, this);
    }

    signExt(count: number): BitVec<number> {
        return SignExt(count, this);
    }

    zeroExt(count: number): BitVec<number> {
        return ZeroExt(count, this);
    }
}

export class BitVecNum<Bits extends number> extends BitVec<Bits> {
    value(): bigint {
        return BigInt(this.toString());
    }
}

export type AnyAst = 
    | AnySort
    | AnyExpr
    | FuncDecl;

export type AnySort =
    | Sort
    | BoolSort
    | ArithSort
    | BitVecSort<number>;

export type AnyExpr =
    | Expr
    | Bool
    | Arith
    | BitVec<number>;

export type SortToExprMap<S extends AnySort> =
    S extends BoolSort ? Bool :
    S extends ArithSort ? Arith :
    S extends BitVecSort<infer Bits> ? BitVec<Bits> :
    // S extends SMTArraySort<infer DomainSort, infer RangeSort> ? SMTArray<DomainSort, RangeSort> :
    S extends Sort ? Expr<S> : never;

function makeAst(ctx: Context, z3_ast: Z3_ast): AnyAst {
    const kind: Z3_ast_kind = ctx.check(libz3.Z3_get_ast_kind(ctx.ptr, z3_ast));
    switch (kind) {
        case Z3_ast_kind.Z3_SORT_AST:
            return makeSort(ctx, z3_ast);
        case Z3_ast_kind.Z3_FUNC_DECL_AST:
            return new FuncDecl(ctx, z3_ast);
        default:
            return makeExpr(ctx, z3_ast);
    }
}

function makeSort(ctx: Context, z3_sort: Z3_sort): AnySort {
    const kind: Z3_sort_kind = ctx.check(libz3.Z3_get_sort_kind(ctx.ptr, z3_sort));
    switch (kind) {
        case Z3_sort_kind.Z3_BOOL_SORT:
            return new BoolSort(ctx, z3_sort);
        case Z3_sort_kind.Z3_INT_SORT:
        case Z3_sort_kind.Z3_REAL_SORT:
            return new ArithSort(ctx, z3_sort);
        case Z3_sort_kind.Z3_BV_SORT:
            return new BitVecSort(ctx, z3_sort);
        // todo: case Z3_sort_kind.Z3_ARRAY_SORT:
        // todo: case Z3_sort_kind.Z3_DATATYPE_SORT:
        // todo: case Z3_sort_kind.Z3_FINITE_DOMAIN_SORT:
        // todo: case Z3_sort_kind.Z3_FLOATING_POINT_SORT:
        // todo: case Z3_sort_kind.Z3_ROUNDING_MODE_SORT:
        // todo: case Z3_sort_kind.Z3_RE_SORT:
        // todo: case Z3_sort_kind.Z3_SEQ_SORT:
        // todo: case Z3_sort_kind.Z3_CHAR_SORT:
        default:
            return new Sort(ctx, z3_sort);
    }
}

function makeExpr(ctx: Context, z3_ast: Z3_ast): AnyExpr {
    const ast_kind = ctx.check(libz3.Z3_get_ast_kind(ctx.ptr, z3_ast));
    if (ast_kind == Z3_ast_kind.Z3_QUANTIFIER_AST) {
        throw new Error('Not implemented yet');
    } else {
        const sort = ctx.check(libz3.Z3_get_sort(ctx.ptr, z3_ast));
        const sort_kind = ctx.check(libz3.Z3_get_sort_kind(ctx.ptr, sort));
        switch (sort_kind) {
            case Z3_sort_kind.Z3_BOOL_SORT:
                return new Bool(ctx, z3_ast);
            case Z3_sort_kind.Z3_INT_SORT:
                if (ast_kind == Z3_ast_kind.Z3_NUMERAL_AST) {
                    return new IntNum(ctx, z3_ast);
                } else {
                    return new Arith(ctx, z3_ast);
                }
            case Z3_sort_kind.Z3_REAL_SORT:
                if (ast_kind == Z3_ast_kind.Z3_NUMERAL_AST) {
                    return new RatNum(ctx, z3_ast);
                } else if (ctx.check(libz3.Z3_is_algebraic_number(ctx.ptr, z3_ast))) {
                    return new AlgebraicNum(ctx, z3_ast);
                } else {
                    return new Arith(ctx, z3_ast);
                }
            case Z3_sort_kind.Z3_BV_SORT:
                if (ast_kind == Z3_ast_kind.Z3_NUMERAL_AST) {
                    return new BitVecNum(ctx, z3_ast);
                } else {
                    return new BitVec(ctx, z3_ast);
                }
            // todo: case Z3_sort_kind.Z3_ARRAY_SORT:
            // todo: case Z3_sort_kind.Z3_DATATYPE_SORT:
            // todo: case Z3_sort_kind.Z3_FLOATING_POINT_SORT:
            // todo: case Z3_sort_kind.Z3_FINITE_DOMAIN_SORT:
            // todo: case Z3_sort_kind.Z3_ROUNDING_MODE_SORT:
            // todo: case Z3_sort_kind.Z3_SEQ_SORT:
            // todo: case Z3_sort_kind.Z3_CHAR_SORT:
            // todo: case Z3_sort_kind.Z3_RE_SORT:
            default:
                return new Expr(ctx, z3_ast);
        }
    }
}

export function Cond(cond: Probe, a: Tactic, b: Tactic): Tactic {
    assertContext(cond, a, b);
    const ctx = cond.ctx;
    return new Tactic(ctx, ctx.check(libz3.Z3_tactic_cond(ctx.ptr, cond.ptr, a.ptr, b.ptr)));
}

export function Ite<E extends AnyExpr>(cond: Bool, a: E, b: E): E {
    assertContext(cond, a, b);
    const ctx = cond.ctx;
    return makeExpr(ctx, ctx.check(libz3.Z3_mk_ite(ctx.ptr, cond.ptr, a.ptr, b.ptr))) as E;
}

export function Distinct<E extends AnyExpr>(...exprs: E[]): Bool {
    assert.ok(exprs.length > 0);
    assertContext(...exprs);
    const ctx = exprs[0].ctx;
    
    const z3_asts = Buffer.alloc(ref.sizeof.pointer * exprs.length) as ref.Pointer<Z3_ast>;
    for (let i = 0; i < exprs.length; ++i) {
        ref.writePointer(z3_asts, i * ref.sizeof.pointer, exprs[i].ptr);
    }

    return new Bool(ctx, ctx.check(libz3.Z3_mk_distinct(ctx.ptr, exprs.length, z3_asts)));
}

export function Const<S extends AnySort>(name: string, sort: S): SortToExprMap<S> {
    const ctx = sort.ctx;
    const symbol = ctx.Symbol.new(name);
    return makeExpr(ctx, ctx.check(libz3.Z3_mk_const(ctx.ptr, symbol.ptr, sort.ptr))) as SortToExprMap<S>;
}

export function Consts<S extends AnySort>(names: string | string[], sort: S): SortToExprMap<S>[] {
    const ctx = sort.ctx;
    if (typeof names === 'string') {
        names = names.split(' ').filter(name => name.length > 0);
    }
    return names.map(name => Const(name, sort));
}

export function FreshConst<S extends Sort>(sort: S, prefix: string = 'c'): SortToExprMap<S> {
    const ctx = sort.ctx;
    return makeExpr(ctx, ctx.check(libz3.Z3_mk_fresh_const(ctx.ptr, prefix, sort.ptr))) as SortToExprMap<S>;
}

export function Var<S extends Sort>(index: number, sort: S): SortToExprMap<S> {
    const ctx = sort.ctx;
    return makeExpr(ctx, ctx.check(libz3.Z3_mk_bound(sort.ctx.ptr, index, sort.ptr))) as SortToExprMap<S>;
}

export function Implies(a: Bool, b: Bool): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_implies(ctx.ptr, a.ptr, b.ptr)));
}

export function Iff(a: Bool, b: Bool): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_iff(ctx.ptr, a.ptr, b.ptr)));
}

export function Xor(a: Bool, b: Bool): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_xor(ctx.ptr, a.ptr, b.ptr)));
}

export function Not(a: Bool): Bool;

export function Not(a: Probe): Probe;

export function Not(a: Bool | Probe): Bool | Probe {
    if (isBool(a)) {
        const ctx = a.ctx;
        return new Bool(ctx, ctx.check(libz3.Z3_mk_not(ctx.ptr, a.ptr)));
    } else {
        const ctx = a.ctx;
        return new Probe(ctx, ctx.check(libz3.Z3_probe_not(ctx.ptr, a.ptr)));
    }
}

export function And(vector: AstVector<Bool>): Bool;

export function And(...args: Bool[]): Bool;

export function And(...args: Probe[]): Probe;

export function And(...args: (Bool | Probe | AstVector<Bool>)[]): Bool | Probe {
    if (args.length === 0 && args[0] instanceof AstVector) {
        throw new Error('Not implemented yet');
    } else if (args.every(arg => isBool(arg))) {
        const ctx = args[0].ctx;
    
        const z3_asts = Buffer.alloc(ref.sizeof.pointer * args.length) as ref.Pointer<Z3_ast>;
        for (let i = 0; i < args.length; ++i) {
            ref.writePointer(z3_asts, i * ref.sizeof.pointer, args[i].ptr);
        }

        return new Bool(ctx, ctx.check(libz3.Z3_mk_and(ctx.ptr, args.length, z3_asts)));
    } else if (args.every(arg => isProbe(arg))) {
        throw new Error('Not implemented yet');
    } else {
        throw new Error('Not implemented yet');
    }
}

export function Or(vector: AstVector<Bool>): Bool;

export function Or(...args: Bool[]): Bool;

export function Or(...args: Probe[]): Probe;

export function Or(...args: (Bool | Probe | AstVector<Bool>)[]): Bool | Probe {
    if (args.length === 0 && args[0] instanceof AstVector) {
        throw new Error('Not implemented yet');
    } else if (args.every(arg => isBool(arg))) {
        const ctx = args[0].ctx;
    
        const z3_asts = Buffer.alloc(ref.sizeof.pointer * args.length) as ref.Pointer<Z3_ast>;
        for (let i = 0; i < args.length; ++i) {
            ref.writePointer(z3_asts, i * ref.sizeof.pointer, args[i].ptr);
        }

        return new Bool(ctx, ctx.check(libz3.Z3_mk_or(ctx.ptr, args.length, z3_asts)));
    } else if (args.every(arg => isProbe(arg))) {
        throw new Error('Not implemented yet');
    } else {
        throw new Error('Not implemented yet');
    }
}

export function Int2Real(expr: Arith): Arith {
    assert.ok(isInt(expr), 'Int expression expected');
    const ctx = expr.ctx;
    return new Arith(ctx, ctx.check(libz3.Z3_mk_int2real(ctx.ptr, expr.ptr)));
}

export function Real2Int(expr: Arith): Arith {
    assert.ok(isReal(expr), 'Real expression expected');
    const ctx = expr.ctx;
    return new Arith(ctx, ctx.check(libz3.Z3_mk_real2int(ctx.ptr, expr.ptr)));
}

export function BV2Int<Bits extends number>(a: BitVec<Bits>, is_signed: boolean): Arith {
    const ctx = a.ctx;
    return new Arith(ctx, ctx.check(libz3.Z3_mk_bv2int(ctx.ptr, a.ptr, is_signed)));
}

export function Int2BV<Bits extends number>(a: Arith, bits: Bits): BitVec<Bits> {
    assert.ok(isInt(a), 'parameter must be an integer');
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_int2bv(ctx.ptr, bits, a.ptr)));
}

// export function Concat<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
//     assertContext(a, b);
//     return bitvecs.reduce((prev, curr) => new BitVecImpl<Bits>(check(Z3.mk_concat(contextPtr, prev.ast, curr.ast))));
// }

export function LT(a: Arith, b: Arith): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_lt(ctx.ptr, a.ptr, b.ptr)));
}

export function LE(a: Arith, b: Arith): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_le(ctx.ptr, a.ptr, b.ptr)));
}

export function GT(a: Arith, b: Arith): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_gt(ctx.ptr, a.ptr, b.ptr)));
}

export function GE(a: Arith, b: Arith): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_ge(ctx.ptr, a.ptr, b.ptr)));
}

export function SLT<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvslt(ctx.ptr, a.ptr, b.ptr)));
}

export function SLE<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvsle(ctx.ptr, a.ptr, b.ptr)));
}

export function SGT<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvsgt(ctx.ptr, a.ptr, b.ptr)));
}

export function SGE<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvsge(ctx.ptr, a.ptr, b.ptr)));
}

export function ULT<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvult(ctx.ptr, a.ptr, b.ptr)));
}

export function ULE<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvule(ctx.ptr, a.ptr, b.ptr)));
}

export function UGT<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvugt(ctx.ptr, a.ptr, b.ptr)));
}

export function UGE<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvuge(ctx.ptr, a.ptr, b.ptr)));
}

export function Extract<Bits extends number>(high: number, low: number, value: BitVec<Bits>): BitVec<number> {
    const ctx = value.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_extract(ctx.ptr, high, low, value.ptr)));
}

export function SignExt<Bits extends number>(count: number, value: BitVec<Bits>): BitVec<number> {
    const ctx = value.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_sign_ext(ctx.ptr, count, value.ptr)));
}

export function ZeroExt<Bits extends number>(count: number, value: BitVec<Bits>): BitVec<number> {
    const ctx = value.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_zero_ext(ctx.ptr, count, value.ptr)));
}

export function Add(...exprs: Arith[]): Arith {
    assert.ok(exprs.length > 0);
    assertContext(...exprs);
    const ctx = exprs[0].ctx;

    const z3_asts = Buffer.alloc(exprs.length * ref.sizeof.pointer) as ref.Pointer<Z3_ast>;
    for (let i = 0; i < exprs.length; ++i) {
        ref.writePointer(z3_asts, i * ref.sizeof.pointer, exprs[i].ptr);
    }

    return new Arith(ctx, ctx.check(libz3.Z3_mk_add(ctx.ptr, exprs.length, z3_asts)));
}

export function Sub(...exprs: Arith[]): Arith {
    assert.ok(exprs.length > 0);
    assertContext(...exprs);
    const ctx = exprs[0].ctx;

    const z3_asts = Buffer.alloc(exprs.length * ref.sizeof.pointer) as ref.Pointer<Z3_ast>;
    for (let i = 0; i < exprs.length; ++i) {
        ref.writePointer(z3_asts, i * ref.sizeof.pointer, exprs[i].ptr);
    }

    return new Arith(ctx, ctx.check(libz3.Z3_mk_sub(ctx.ptr, exprs.length, z3_asts)));
}

export function Mul(...exprs: Arith[]): Arith {
    assert.ok(exprs.length > 0);
    assertContext(...exprs);
    const ctx = exprs[0].ctx;

    const z3_asts = Buffer.alloc(exprs.length * ref.sizeof.pointer) as ref.Pointer<Z3_ast>;
    for (let i = 0; i < exprs.length; ++i) {
        ref.writePointer(z3_asts, i * ref.sizeof.pointer, exprs[i].ptr);
    }

    return new Arith(ctx, ctx.check(libz3.Z3_mk_mul(ctx.ptr, exprs.length, z3_asts)));
}

export function Div(a: Arith, b: Arith): Arith {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Arith(ctx, ctx.check(libz3.Z3_mk_div(ctx.ptr, a.ptr, b.ptr)));
}

export function Mod(a: Arith, b: Arith): Arith {
    assert.ok(isInt(a));
    assert.ok(isInt(b));
    assertContext(a, b);
    const ctx = a.ctx;
    return new Arith(ctx, ctx.check(libz3.Z3_mk_mod(ctx.ptr, a.ptr, b.ptr)));
}

export function Neg(a: Arith): Arith {
    const ctx = a.ctx;
    return new Arith(ctx, ctx.check(libz3.Z3_mk_unary_minus(ctx.ptr, a.ptr)));
}

export function BVAdd<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvadd(ctx.ptr, a.ptr, b.ptr)));
}

export function BVAddNoOverflow<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>, is_signed: boolean): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvadd_no_overflow(ctx.ptr, a.ptr, b.ptr, is_signed)));
}

export function BVAddNoUnderflow<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvadd_no_underflow(ctx.ptr, a.ptr, b.ptr)));
}

export function BVSub<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvsub(ctx.ptr, a.ptr, b.ptr)));
}

export function BVSubNoOverflow<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvsub_no_overflow(ctx.ptr, a.ptr, b.ptr)));
}

export function BVSubNoUnderflow<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>, is_signed: boolean): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvsub_no_underflow(ctx.ptr, a.ptr, b.ptr, is_signed)));
}

export function BVMul<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvmul(ctx.ptr, a.ptr, b.ptr)));
}

export function BVMulNoOverflow<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>, is_signed: boolean): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvmul_no_overflow(ctx.ptr, a.ptr, b.ptr, is_signed)));
}

export function BVMulNoUnderflow<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvmul_no_underflow(ctx.ptr, a.ptr, b.ptr)));
}

export function BVSDiv<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvsdiv(ctx.ptr, a.ptr, b.ptr)));
}

export function BVSDivNoOverflow<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): Bool {
    assertContext(a, b);
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvsdiv_no_overflow(ctx.ptr, a.ptr, b.ptr)));
}

export function BVSRem<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvsrem(ctx.ptr, a.ptr, b.ptr)));
}

export function BVSMod<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvsmod(ctx.ptr, a.ptr, b.ptr)));
}

export function BVUDiv<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvudiv(ctx.ptr, a.ptr, b.ptr)));
}

export function BVURem<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvurem(ctx.ptr, a.ptr, b.ptr)));
}

export function BVNeg<Bits extends number>(a: BitVec<Bits>): BitVec<Bits> {
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvneg(ctx.ptr, a.ptr)));
}

export function BVNegNoOverflow<Bits extends number>(a: BitVec<Bits>): Bool {
    const ctx = a.ctx;
    return new Bool(ctx, ctx.check(libz3.Z3_mk_bvneg_no_overflow(ctx.ptr, a.ptr)));
}

export function BVAnd<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvand(ctx.ptr, a.ptr, b.ptr)));
}

export function BVOr<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvor(ctx.ptr, a.ptr, b.ptr)));
}

export function BVXor<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvxor(ctx.ptr, a.ptr, b.ptr)));
}

export function BVNot<Bits extends number>(a: BitVec<Bits>): BitVec<Bits> {
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvnot(ctx.ptr, a.ptr)));
}

export function BVNand<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvnand(ctx.ptr, a.ptr, b.ptr)));
}

export function BVNor<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvnor(ctx.ptr, a.ptr, b.ptr)));
}

export function BVXnor<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvxnor(ctx.ptr, a.ptr, b.ptr)));
}

export function BVShl<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvshl(ctx.ptr, a.ptr, b.ptr)));
}

export function BVAShr<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvashr(ctx.ptr, a.ptr, b.ptr)));
}

export function BVLShr<Bits extends number>(a: BitVec<Bits>, b: BitVec<Bits>): BitVec<Bits> {
    assertContext(a, b);
    const ctx = a.ctx;
    return new BitVec(ctx, ctx.check(libz3.Z3_mk_bvlshr(ctx.ptr, a.ptr, b.ptr)));
}

export class Solver {
    readonly ctx: Context;
    readonly ptr: Z3_solver;

    constructor(ctx: Context, ptr: Z3_solver) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_solver_inc_ref(ctx.ptr, ptr);
        cleanup.register(this, () => libz3.Z3_solver_dec_ref(z3_ctx, ptr));
    }

    set(options: Record<string, boolean | number | string>) {
        const params = this.ctx.Params.new(options);
        this.ctx.check(libz3.Z3_solver_set_params(this.ctx.ptr, this.ptr, params.ptr));
    }

    assert(expr: Bool) {
        this.ctx.check(libz3.Z3_solver_assert(this.ctx.ptr, this.ptr, expr.ptr));
    }

    assertAndTrack(expr: Bool, constant: Bool | string) {
        if (typeof constant === 'string') {
            constant = this.ctx.Bool.const(constant);
        }
        assert.ok(expr instanceof Bool, 'Boolean expression expected');
        assert.ok(constant instanceof Bool && isConst(constant), 'Boolean expression expected');
        this.ctx.check(libz3.Z3_solver_assert_and_track(this.ctx.ptr, this.ptr, expr.ptr, constant.ptr));
    }

    assertions(): AstVector<Bool> {
        const z3_ast_vector = this.ctx.check(libz3.Z3_solver_get_assertions(this.ctx.ptr, this.ptr));
        return new AstVector(this.ctx, z3_ast_vector);
    }

    push() {
        this.ctx.check(libz3.Z3_solver_push(this.ctx.ptr, this.ptr));
    }

    pop(num: number = 1) {
        this.ctx.check(libz3.Z3_solver_pop(this.ctx.ptr, this.ptr, num));
    }

    numScopes(): number {
        return this.ctx.check(libz3.Z3_solver_get_num_scopes(this.ctx.ptr, this.ptr));
    }

    reset() {
        this.ctx.check(libz3.Z3_solver_reset(this.ctx.ptr, this.ptr));
    }

    proof(): AnyExpr {
        const z3_ast = this.ctx.check(libz3.Z3_solver_get_proof(this.ctx.ptr, this.ptr));
        return makeExpr(this.ctx, z3_ast);
    }

    check(...assumptions: (Bool | AstVector<Bool>)[]): CheckSatResult {
        let result: Z3_lbool;

        if (assumptions.length === 0) {
            result = this.ctx.check(libz3.Z3_solver_check(this.ctx.ptr, this.ptr));
        } else {
            if (assumptions.length === 1 && isAstVector(assumptions[0])) {
                throw new Error('Not implemented yet');
            }

            assert.ok(assumptions.every(assumption => isBool(assumption)));

            const assumption_asts = Buffer.alloc(assumptions.length * ref.sizeof.pointer) as ref.Pointer<Z3_ast>;
            for (let i = 0; i < assumptions.length; ++i) {
                ref.writePointer(assumption_asts, i * ref.sizeof.pointer, assumptions[i].ptr);
            }

            result = this.ctx.check(libz3.Z3_solver_check_assumptions(this.ctx.ptr, this.ptr, assumptions.length, assumption_asts));
        }

        switch (result) {
            case Z3_lbool.Z3_L_FALSE:
                return 'unsat';
            case Z3_lbool.Z3_L_TRUE:
                return 'sat';
            case Z3_lbool.Z3_L_UNDEF:
                return 'unknown';
            default:
                throw new Error('Unexpected code execution detected, should be caught at compile time');
        }
    }

    model(): Model {
        return new Model(this.ctx, this.ctx.check(libz3.Z3_solver_get_model(this.ctx.ptr, this.ptr)));
    }

    statistics(): Statistics {
        return new Statistics(this.ctx, this.ctx.check(libz3.Z3_solver_get_statistics(this.ctx.ptr, this.ptr)));
    }

    toString(): string {
        return this.ctx.check(libz3.Z3_solver_to_string(this.ctx.ptr, this.ptr))!;
    }

    fromString(s: string) {
        this.ctx.check(libz3.Z3_solver_from_string(this.ctx.ptr, this.ptr, s));
    }
}

export class Goal {
    readonly ctx: Context;
    readonly ptr: Z3_goal;

    constructor(ctx: Context, ptr: Z3_goal) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_goal_inc_ref(z3_ctx, ptr);
        cleanup.register(this, () => libz3.Z3_goal_dec_ref(z3_ctx, ptr));
    }

    size(): number {
        return libz3.Z3_goal_size(this.ctx.ptr, this.ptr);
    }

    precision(): Z3_goal_prec {
        return libz3.Z3_goal_precision(this.ctx.ptr, this.ptr);
    }

    depth(): number {
        return libz3.Z3_goal_depth(this.ctx.ptr, this.ptr);
    }

    inconsistent(): boolean {
        return libz3.Z3_goal_inconsistent(this.ctx.ptr, this.ptr);
    }

    reset() {
        libz3.Z3_goal_reset(this.ctx.ptr, this.ptr);
    }

    convertModel(model: Model): Model {
        assertContext(this, model);
        return new Model(this.ctx, this.ctx.check(libz3.Z3_goal_convert_model(this.ctx.ptr, this.ptr, model.ptr)));
    }

    dimacs(include_names: boolean = true): string {
        return libz3.Z3_goal_to_dimacs_string(this.ctx.ptr, this.ptr, include_names)!;
    }

    toString(): string {
        return libz3.Z3_goal_to_string(this.ctx.ptr, this.ptr)!;
    }
}

export class ApplyResult {
    readonly ctx: Context;
    readonly ptr: Z3_apply_result;

    constructor(ctx: Context, ptr: Z3_apply_result) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_apply_result_inc_ref(z3_ctx, ptr);
        cleanup.register(this, () => libz3.Z3_apply_result_dec_ref(z3_ctx, ptr));
    }

    size(): number {
        return libz3.Z3_apply_result_get_num_subgoals(this.ctx.ptr, this.ptr);
    }

    toString(): string {
        return libz3.Z3_apply_result_to_string(this.ctx.ptr, this.ptr)!;
    }
}

export class Tactic {
    readonly ctx: Context;
    readonly ptr: Z3_tactic;

    constructor(ctx: Context, ptr: Z3_tactic) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_tactic_inc_ref(ctx.ptr, ptr);
        cleanup.register(this, () => libz3.Z3_tactic_dec_ref(z3_ctx, ptr));
    }

    apply(goal: Goal): ApplyResult {
        assertContext(this, goal);
        const z3_apply_result = this.ctx.check(libz3.Z3_tactic_apply(this.ctx.ptr, this.ptr, goal.ptr));
        return new ApplyResult(this.ctx, z3_apply_result);
    }

    getParamDescrs(): ParamDescrs {
        const z3_param_descrs = this.ctx.check(libz3.Z3_tactic_get_param_descrs(this.ctx.ptr, this.ptr));
        return new ParamDescrs(this.ctx, z3_param_descrs);
    }

    help(): string {
        return this.ctx.check(libz3.Z3_tactic_get_help(this.ctx.ptr, this.ptr))!;
    }

    makeSolver(): Solver {
        const z3_solver = this.ctx.check(libz3.Z3_mk_solver_from_tactic(this.ctx.ptr, this.ptr));
        return new Solver(this.ctx, z3_solver);
    }
}

export class Simplifier {
    readonly ctx: Context;
    readonly ptr: Z3_simplifier;

    constructor(ctx: Context, ptr: Z3_optimize) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_simplifier_inc_ref(ctx.ptr, ptr);
        cleanup.register(this, () => libz3.Z3_simplifier_dec_ref(z3_ctx, ptr));
    }

    getParamDescrs(): ParamDescrs {
        return new ParamDescrs(this.ctx, libz3.Z3_simplifier_get_param_descrs(this.ctx.ptr, this.ptr));
    }

    help(): string {
        return this.ctx.check(libz3.Z3_simplifier_get_help(this.ctx.ptr, this.ptr))!;
    }
}

export class Optimize {
    readonly ctx: Context;
    readonly ptr: Z3_optimize;

    constructor(ctx: Context, ptr: Z3_optimize) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_optimize_inc_ref(ctx.ptr, ptr);
        cleanup.register(this, () => libz3.Z3_optimize_dec_ref(z3_ctx, ptr));
    }

    set(options: Record<string, boolean | number | string>) {
        const params = this.ctx.Params.new(options);
        this.ctx.check(libz3.Z3_optimize_set_params(this.ctx.ptr, this.ptr, params.ptr));
    }

    push() {
        this.ctx.check(libz3.Z3_optimize_push(this.ctx.ptr, this.ptr));
    }

    pop() {
        this.ctx.check(libz3.Z3_optimize_pop(this.ctx.ptr, this.ptr));
    }

    // todo: add

    // todo: addSoft

    // todo: addAndTrack

    // todo: assertions

    // todo: maximize

    // todo: minimize

    // todo: check

    model(): Model {
        return new Model(this.ctx, this.ctx.check(libz3.Z3_optimize_get_model(this.ctx.ptr, this.ptr)));
    }

    statistics(): Statistics {
        return new Statistics(this.ctx, this.ctx.check(libz3.Z3_optimize_get_statistics(this.ctx.ptr, this.ptr)));
    }

    toString(): string {
        return this.ctx.check(libz3.Z3_optimize_to_string(this.ctx.ptr, this.ptr))!;
    }

    fromString(s: string) {
        this.ctx.check(libz3.Z3_optimize_from_string(this.ctx.ptr, this.ptr, s));
    }
}

export class Model {
    readonly ctx: Context;
    readonly ptr: Z3_model;

    constructor(ctx: Context, ptr: Z3_model) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_model_inc_ref(ctx.ptr, ptr);
        cleanup.register(this, () => libz3.Z3_model_dec_ref(z3_ctx, ptr));
    }

    size(): number {
        const num_consts = libz3.Z3_model_get_num_consts(this.ctx.ptr, this.ptr);
        const num_funcs = libz3.Z3_model_get_num_funcs(this.ctx.ptr, this.ptr);
        return num_consts + num_funcs;
    }

    // todo: [Symbol.iterator]()

    // todo: entries()

    // todo: keys()

    // todo: values()

    // todo: decls()

    sexpr(): string {
        return this.ctx.check(libz3.Z3_model_to_string(this.ctx.ptr, this.ptr))!;
    }

    toString(): string {
        return this.ctx.check(libz3.Z3_model_to_string(this.ctx.ptr, this.ptr))!;
    }

    // todo: eval(...)

    // todo: get(...)

    // todo: updateValue(...)

    // todo: addFuncInterp

    // todo: getUniverse
}

export class FuncInterp {
    readonly ctx: Context;
    readonly ptr: Z3_func_interp;

    constructor(ctx: Context, ptr: Z3_func_interp) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_func_interp_inc_ref(z3_ctx, ptr);
        cleanup.register(this, () => libz3.Z3_func_interp_dec_ref(z3_ctx, ptr));
    }

    arity(): number {
        return this.ctx.check(libz3.Z3_func_interp_get_arity(this.ctx.ptr, this.ptr));
    }

    entry(i: number): FuncEntry {
        return new FuncEntry(this.ctx, this.ctx.check(libz3.Z3_func_interp_get_entry(this.ctx.ptr, this.ptr, i)));
    }

    numEntries(): number {
        return this.ctx.check(libz3.Z3_func_interp_get_num_entries(this.ctx.ptr, this.ptr));
    }
}

export class FuncEntry {
    readonly ctx: Context;
    readonly ptr: Z3_func_entry;

    constructor(ctx: Context, ptr: Z3_func_entry) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_func_entry_inc_ref(z3_ctx, ptr);
        cleanup.register(this, () => libz3.Z3_func_entry_dec_ref(z3_ctx, ptr));
    }

    // todo: arg

    // todo: value

    numArgs(): number {
        return this.ctx.check(libz3.Z3_func_entry_get_num_args(this.ctx.ptr, this.ptr));
    }
}

export class Statistics {
    readonly ctx: Context;
    readonly ptr: Z3_stats;

    constructor(ctx: Context, ptr: Z3_stats) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_stats_inc_ref(ctx.ptr, ptr);
        cleanup.register(this, () => libz3.Z3_stats_dec_ref(z3_ctx, ptr));
    }

    size(): number {
        return this.ctx.check(libz3.Z3_stats_size(this.ctx.ptr, this.ptr));
    }

    keys(): string[] {
        const strings = [];
        const num_strings = this.size();
        for (let i = 0; i < num_strings; ++i) {
            strings.push(this.ctx.check(libz3.Z3_stats_get_key(this.ctx.ptr, this.ptr, i))!);
        }
        return strings;
    }

    toString(): string {
        return this.ctx.check(libz3.Z3_stats_to_string(this.ctx.ptr, this.ptr))!;
    }
}

export class Probe {
    readonly ctx: Context;
    readonly ptr: Z3_probe;

    constructor(ctx: Context, ptr: Z3_probe) {
        const z3_ctx = ctx.ptr;

        this.ctx = ctx;
        this.ptr = ptr;

        libz3.Z3_probe_inc_ref(z3_ctx, ptr);
        cleanup.register(this, () => libz3.Z3_probe_dec_ref(z3_ctx, ptr));
    }
}

export function isAst(obj: unknown): obj is Ast {
    return obj instanceof Ast;
}

export function isSort(obj: unknown): obj is Sort {
    return obj instanceof Sort;
}

export function isFuncDecl(obj: unknown): obj is FuncDecl {
    return obj instanceof FuncDecl;
}

export function isFuncInterp(obj: unknown): obj is FuncInterp {
    return obj instanceof FuncInterp;
}

export function isExpr(obj: unknown): obj is Expr {
    return obj instanceof Expr;
}

export function isBoolSort(obj: unknown): obj is BoolSort {
    return obj instanceof BoolSort;
}

export function isBool(obj: unknown): obj is Bool {
    return obj instanceof Bool
}

export function isQuantifier(obj: unknown): obj is Quantifier {
    return obj instanceof Quantifier;
}

export function isArithSort(obj: unknown): obj is ArithSort {
    return obj instanceof ArithSort;
}

export function isArith(obj: unknown): obj is Arith {
    return obj instanceof Arith;
}

export function isIntSort(obj: unknown): obj is ArithSort {
    return isArithSort(obj) && obj.kind() === Z3_sort_kind.Z3_INT_SORT;
}

export function isInt(obj: unknown): obj is Arith {
    return isArith(obj) && isIntSort(obj.sort());
}

export function isIntNum(obj: unknown): obj is IntNum {
    return obj instanceof IntNum;
}

export function isRealSort(obj: unknown): obj is ArithSort {
    return isArithSort(obj) && obj.kind() === Z3_sort_kind.Z3_REAL_SORT;
}

export function isReal(obj: unknown): obj is Arith {
    return isArith(obj) && isRealSort(obj.sort());
}

export function isRatNum(obj: unknown): obj is RatNum {
    return obj instanceof RatNum;
}

export function isAlgebraicNum(obj: unknown): obj is AlgebraicNum {
    return obj instanceof AlgebraicNum;
}

export function isBitVecSort(obj: unknown): obj is BitVecSort<number> {
    return obj instanceof BitVecSort;
}

export function isBitVec(obj: unknown): obj is BitVec<number> {
    return obj instanceof BitVec;
}

export function isApp(obj: unknown): obj is Expr {
    if (isExpr(obj)) {
        const kind: Z3_ast_kind = obj.ctx.check(libz3.Z3_get_ast_kind(obj.ctx.ptr, obj.ptr));
        return kind === Z3_ast_kind.Z3_NUMERAL_AST || kind === Z3_ast_kind.Z3_APP_AST;
    } else {
        return false;
    }
}

export function isAppOf(obj: unknown, kind: Z3_decl_kind): obj is Expr {
    return isApp(obj) && obj.decl().kind() === kind;
}

export function isConst(obj: unknown): obj is Expr {
    return isApp(obj) && obj.numArgs() === 0;
}

export function isVar(obj: unknown): obj is Expr {
    return isExpr(obj) && obj.ctx.check(libz3.Z3_get_ast_kind(obj.ctx.ptr, obj.ptr)) == Z3_ast_kind.Z3_VAR_AST;
}

export function isTactic(obj: unknown): obj is Tactic {
    return obj instanceof Tactic;
}

export function isProbe(obj: unknown): obj is Probe {
    return obj instanceof Probe;
}

export function isAstVector<I extends AnyAst = AnyAst>(obj: unknown): obj is AstVector<I> {
    return obj instanceof AstVector;
}

export function isAstMap<K extends AnyAst = AnyAst, V extends AnyAst = AnyAst>(obj: unknown): obj is AstMap<K, V> {
    return obj instanceof AstMap;
}

export function solve(...assertions: Bool[]): Model | 'unsat' | 'unknown' {
    assert.ok(assertions.length > 0);
    assertContext(...assertions);

    const ctx = assertions[0].ctx;
    const solver = ctx.Solver.new();

    for (let assertion of assertions) {
        solver.assert(assertion);
    }

    const result = solver.check();
    return result === 'sat' ? solver.model() : result;
}

export function simplify(expr: Expr, options?: Record<string, boolean | number | string>): AnyExpr {
    const ctx = expr.ctx;
    if (options === undefined) {
        return makeExpr(ctx, ctx.check(libz3.Z3_simplify(ctx.ptr, expr.ptr)));
    } else {
        const params = ctx.Params.new(options);
        return makeExpr(ctx, ctx.check(libz3.Z3_simplify_ex(ctx.ptr, expr.ptr, params.ptr)));
    }
}
