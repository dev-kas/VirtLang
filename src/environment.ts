import { MK_BOOL, MK_NATIVE_FN, MK_NIL, MK_NUMBER, RuntimeVal, ObjectVal } from "./values.js";
import { array, math, out, proc } from "./globals.js";

export function createGlobalEnv(): Environment {
    const env = new Environment();

    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);

    env.declareVar("nil", MK_NIL(), true);
    env.declareVar("null", MK_NIL(), true);
    env.declareVar("NaN", MK_NUMBER(NaN), true);
    env.declareVar("inf", MK_NUMBER(Infinity), true);

    env.declareVar("out", out, true);
    env.declareVar("proc", proc, true);
    env.declareVar("math", math, true);
    env.declareVar("Array", array, true);
    return env;
}

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor(parentENV?: Environment) {
        const global = !parentENV ? true : false
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVar(varname: string, value: RuntimeVal, constant: boolean = false): RuntimeVal {
        if (this.variables.has(varname)) {
            console.error("Runtime error: Variable already declared", varname);
            process.exit(1);
        }

        this.variables.set(varname, value);
        if (constant) this.constants.add(varname);
        return value;
    }

    public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
        const env = this.resolve(varname);
        if (env.constants.has(varname)) {
            console.error("Runtime error: Cannot assign to constant", varname);
            process.exit(1);
        }
        env.variables.set(varname, value);
        return value;
    }

    public resolve(varname: string): Environment {
        if (this.variables.has(varname)) return this;
        if (!this.parent) {
            console.error("Runtime error: Cannot resolve:", varname);
            process.exit(1);
        }
        return this.parent.resolve(varname);
    }

    public lookupVar(varname: string): RuntimeVal {
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeVal;
    }
}