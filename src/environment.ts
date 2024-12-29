import { RuntimeError } from "./errors";
import { array, /* math, */ out /* , proc */, import_ } from "./globals";
import { MK_BOOL, MK_NIL, MK_NUMBER, RuntimeVal } from "./values";

export function createGlobalEnv(): Environment {
    const env = new Environment();

    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);

    env.declareVar("nil", MK_NIL(), true);
    env.declareVar("null", MK_NIL(), true);
    env.declareVar("NaN", MK_NUMBER(NaN), true);
    env.declareVar("inf", MK_NUMBER(Infinity), true);

    env.declareVar("out", out, true);
    env.declareVar("Array", array, true);
    env.declareVar("import", import_, true);

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
        // FIXME: Investigate varname being empty str
        if (varname === "") return value;

        if (this.variables.has(varname)) {
            throw new RuntimeError(`Variable ${varname} is already declared`);
        }

        this.variables.set(varname, value);
        if (constant) this.constants.add(varname);
        return value;
    }

    public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
        // FIXME: Investigate varname being empty str
        if (varname === "") return value;

        const env = this.resolve(varname);
        if (env.constants.has(varname)) {
            throw new RuntimeError(`Cannot reassign constant ${varname}`);
        }
        env.variables.set(varname, value);
        return value;
    }

    public resolve(varname: string): Environment {
        if (this.variables.has(varname)) return this;
        if (!this.parent) {
            throw new RuntimeError(`Cannot resolve ${varname}`);
        }
        return this.parent.resolve(varname);
    }

    public lookupVar(varname: string): RuntimeVal {
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeVal;
    }
}