import Environment, { createGlobalEnv } from "./environment";
import { RuntimeError } from "./errors";
import { evaluate } from "./interpreter";
import { Parser } from "./parser";
import { MK_NATIVE_FN, MK_NIL, MK_NUMBER, MK_OBJECT, ObjectVal, RuntimeVal } from "./values";

import { readFileSync } from "fs";

// const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
// const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

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
// export const proc: RuntimeVal = MK_OBJECT({
//     exit: MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
//         process.exit(args[0]?.value as number || 0);
//     })
// });

// importing a library
const importCache = new Map<string, RuntimeVal>();
export const import_ = MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
    if (args[0] && typeof args[0].value === 'string') {
        if (args[0].value.trim() !== "") {
            let libName = args[0].value;
            // const isNative = libName.startsWith("@");
            let libPath = libName + ".vl";
            const useCache = args[1] && typeof args[1].value === 'boolean' && args[1].value;

            // if (isNative) {
            //     libName = libName.slice(1);
            //     libPath = "./vlm/" + libName + "/index.vl";
            // }

            if (importCache.has(libPath) && useCache) {
                return importCache.get(libPath)!;
            }

            try {
                const libSource = readFileSync(libPath, "utf-8");
                const parser = new Parser();
                const lib = parser.produceAST(libSource);
                const libScope = createGlobalEnv();
                const libExports = evaluate(lib, libScope);

                importCache.set(libPath, libExports);

                return libExports;
            } catch (error) {
                if ((error as any).code === 'ENOENT') {
                    throw new RuntimeError(`Library file ${libPath} not found`);
                } else {
                    throw new RuntimeError(`Failed to import ${libName} from ${libPath}: ${(error as Error).message}`);
                }
            }
        } else {
            throw new RuntimeError(`\`import\` function expects a non-empty string as argument, got: \`${args[0].value}\``);
        }
    } else {
        throw new RuntimeError(`\`import\` function expects a string as argument, got: \`${args[0].value}\``);
    }
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
