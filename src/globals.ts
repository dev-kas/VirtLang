import Environment from "./environment";
import { RuntimeError } from "./errors";
import { MK_NATIVE_FN, MK_NIL, MK_NUMBER, MK_OBJECT, ObjectVal, RuntimeVal } from "./values";


// The standard output library
export const out: RuntimeVal = MK_OBJECT({
    print: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        args = args.map((arg) => arg.value ?? (arg as any).properties);
        console.log(...args);
        return MK_NIL();
    }),

    warn: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        args = args.map((arg) => arg.value ?? (arg as any).properties);
        console.warn(...args);
        return MK_NIL();
    }),

    error: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        args = args.map((arg) => arg.value ?? (arg as any).properties);
        console.error(...args);
        return MK_NIL();
    }),

    clear: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        console.clear();
        return MK_NIL();
    })
});

// The process library
export const proc: RuntimeVal = MK_OBJECT({
    exit: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        process.exit(args[0]?.value as number || 0);
    })
});

// The math library
export const math: RuntimeVal = MK_OBJECT({
    E: MK_NUMBER(Math.E),
    LN2: MK_NUMBER(Math.LN2),
    LN10: MK_NUMBER(Math.LN10),
    LOG2E: MK_NUMBER(Math.LOG2E),
    LOG10E: MK_NUMBER(Math.LOG10E),
    PI: MK_NUMBER(Math.PI),
    SQRT1_2: MK_NUMBER(Math.SQRT1_2),
    SQRT2: MK_NUMBER(Math.SQRT2),

    abs: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        if (args.length !== 1) { throw new RuntimeError("`abs` function expects exactly one argument"); }
        const value = args[0].value;

        if (typeof value === 'number') {
            return MK_NUMBER(Math.abs(value));
        } else { throw new RuntimeError("`abs` function expects a number as argument"); }
    }),
});

// The Array library
export const array: RuntimeVal = MK_OBJECT({
    new: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        let o: { [key: number]: RuntimeVal } = {};

        for (let i = 0; i < args.length; i++) {
            o[i] = args[i];
        }

        return MK_OBJECT(o);
    }),

    push: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        let arr = args[0] as ObjectVal;
        let element = args[1];

        if (arr.type !== "object") { throw new RuntimeError("`push` function expects an object as first argument"); }
        if (element === undefined) { throw new RuntimeError("`push` function expects an element as second argument"); }

        arr.properties.set(arr.properties.size.toString(), element);
        return arr;
    }),

    pop: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        let arr = args[0] as ObjectVal;

        if (arr.type !== "object") { throw new RuntimeError("`pop` function expects an object as first argument"); }

        const lastElement = arr.properties.get((arr.properties.size - 1).toString());
        arr.properties.delete((arr.properties.size - 1).toString());
        return lastElement as RuntimeVal;
    }),

    length: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
        let arr = args[0] as ObjectVal;

        if (arr.type !== "object") { throw new RuntimeError("`length` function expects an object as first argument"); }

        return MK_NUMBER(arr.properties.size);
    }),
})
