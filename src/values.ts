import { Stmt } from "./ast";
import Environment from "./environment";

export type ValueType = "nil" | "number" | "boolean" | "object" | "native-fn" | "function" | "string";

export interface RuntimeVal {
    type: ValueType;
    value : any; //
    // properties? : any;
}

export interface NilVal extends RuntimeVal {
    type: "nil";
    value: null;
}

export function MK_NIL(): NilVal {
    return { type: "nil", value: null} as NilVal;
}

export interface BooleanVal extends RuntimeVal {
    type: "boolean";
    value: boolean;
}

export function MK_BOOL(v = false): BooleanVal {
    return { type: "boolean", value: v} as BooleanVal;
}

export interface NumberVal extends RuntimeVal {
    type: "number";
    value: number;
}

export function MK_NUMBER(n = 0): NumberVal {
    return { type: "number", value: n} as NumberVal;
}

export interface StringVal extends RuntimeVal {
    type: "string";
    value: string;
}

export function MK_STRING(str = ""): StringVal {
    return { type: "string", value: str} as StringVal;
}

export interface ObjectVal extends RuntimeVal {
    type: "object";
    properties: Map<string, RuntimeVal>;
}

export function MK_OBJECT(o: object): ObjectVal {
    const properties = new Map<string, RuntimeVal>();

    for (const [key, value] of Object.entries(o)) {
        properties.set(key, value);
    }

    return { type: "object", properties} as ObjectVal;
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;

export interface NativeFnValue extends RuntimeVal {
    type: "native-fn";
    call: FunctionCall;
}

export function MK_NATIVE_FN(call: FunctionCall) {
    return {
        type: "native-fn" as ValueType,
        call,
        value: null 
    }
}

export interface FunctionValue extends RuntimeVal {
    type: "function";
    name: string;
    params: string[];
    declarationEnv: Environment;
    body: Stmt[];
}
