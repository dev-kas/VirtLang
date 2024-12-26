import { Identifier, BinaryExpr, VarAssignmentExpr, ObjectLiteral, CallExpr, CompareExpr, MemberExpr } from "./ast.js";
import Environment from "./environment.js";
import { evaluate } from "./interpreter.js";
import { RuntimeVal, MK_NUMBER, NumberVal, ObjectVal, MK_NIL, NativeFnValue, FunctionValue, MK_BOOL } from "./values.js";

export function evalIdentifier(id: Identifier, env: Environment): RuntimeVal {
    const value = env.lookupVar(id.symbol);

    if (!value) {
        console.error("Runtime error: Undefined variable", id.symbol);
        process.exit(1);
    }

    return value;
};

export function evalObjectExpr(o: ObjectLiteral, env: Environment): RuntimeVal {
    const obj = { type: "object", properties: new Map()} as ObjectVal;

    for (const {key, value} of o.properties) {
        const runtimeVal =  value === undefined ? env.lookupVar(key) : evaluate(value, env);

        obj.properties.set(key, runtimeVal);
    }

    return obj;
}

export function evalBinEx(binop: BinaryExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(binop.lhs, env);
    const rhs = evaluate(binop.rhs, env);

    if (lhs.type !== "number" || rhs.type !== "number") {
        console.error("Runtime error: Invalid operands for binary expression", lhs, rhs);
        process.exit(1);
    }

    switch (binop.operator) {
        case "+":
            return MK_NUMBER((lhs as NumberVal).value + (rhs as NumberVal).value);
        case "-":
            return MK_NUMBER((lhs as NumberVal).value - (rhs as NumberVal).value);
        case "*":
            return MK_NUMBER((lhs as NumberVal).value * (rhs as NumberVal).value);
        case "/":
            return MK_NUMBER((lhs as NumberVal).value / (rhs as NumberVal).value);
        case "%":
            return MK_NUMBER((lhs as NumberVal).value % (rhs as NumberVal).value);
        default:
            console.error("Runtime error: Unknown operator", binop.operator);
            process.exit(1);
    }
}

export function evalComEx(comop: CompareExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(comop.lhs, env);
    const rhs = evaluate(comop.rhs, env);

    if (lhs.type !== "number" || rhs.type !== "number") {
        console.error("Runtime error: Invalid operands for compare expression", lhs, rhs);
        process.exit(1);
    }

    // console.log(lhs, rhs);

    switch (comop.operator) {
        case "==":
            return MK_BOOL(lhs.value === rhs.value);
        case "!=":
            return MK_BOOL(lhs.value !== rhs.value);
        case ">":
            return MK_BOOL(lhs.value > rhs.value);
        case "<":
            return MK_BOOL(lhs.value < rhs.value);
        case "=>":
            return MK_BOOL(lhs.value >= rhs.value);
        case "<=":
            return MK_BOOL(lhs.value <= rhs.value);
        default:
            console.error("Runtime error: Unknown operator", comop.operator);
            process.exit(1);
    }
}

export function evalVarAssignment(node: VarAssignmentExpr, env: Environment): RuntimeVal {
    if (node.assignee.type !== "Identifier") {
        console.error("Runtime error: Invalid assignee in assignment expression");
        process.exit(1);
    }

    const varname = (node.assignee as Identifier).symbol;
    return env.assignVar(varname, evaluate(node.value, env));
}

export function evalCallExpr(expr: CallExpr, env: Environment): RuntimeVal {
    const args = expr.args.map((arg) => evaluate(arg, env));
    const fn = evaluate(expr.callee, env);

    if (fn.type === "native-fn") {
        const result = (fn as NativeFnValue).call(args, env);
        return result;
    } else if (fn.type === "function") {
        const func = fn as FunctionValue;
        const scope = new Environment(func.declarationEnv);

        for (let i = 0; i < func.params.length; i++) {
            // TODO: Check bounds
            // Verify arity of fn
            const varName = func.params[i];
            scope.declareVar(varName, args[i], false);
        }

        let result: RuntimeVal = MK_NIL();
        for (const stmt of func.body) {
            result = evaluate(stmt, scope);
        }
        return result;
    } else {
        console.error("Cannot call " + fn.type);
        process.exit(1);
    }

    
}

export function evalMemberExpr(expr: MemberExpr, env: Environment): RuntimeVal {
    const obj = evaluate(expr.object, env) as ObjectVal;
    if (obj.type !== "object") {
        console.error("Runtime error: Cannot access property of non-object", obj);
        process.exit(1);
    }

    const property = expr.computed ? evaluate(expr.value, env) : expr.value;
    const key = property.type === "Identifier" ? (property as Identifier).symbol : (property as RuntimeVal).value.toString();

    if (!obj.properties.has(key)) {
        // console.error("Runtime error: Cannot resolve property:", key);
        // process.exit(1);

        return MK_NIL();
    }

    return obj.properties.get(key) as RuntimeVal;
}
