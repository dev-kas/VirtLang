import { RuntimeError } from "./errors.js";
import { Identifier, BinaryExpr, VarAssignmentExpr, ObjectLiteral, CallExpr, CompareExpr, MemberExpr } from "./ast.js";
import Environment from "./environment.js";
import { evaluate } from "./interpreter.js";
import { RuntimeVal, MK_NUMBER, NumberVal, ObjectVal, MK_NIL, NativeFnValue, FunctionValue, MK_BOOL } from "./values.js";

export function evalIdentifier(id: Identifier, env: Environment): RuntimeVal {
    const value = env.lookupVar(id.symbol);

    if (!value) {
        throw new RuntimeError(`Undefined variable ${id.symbol}`);
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
        throw new RuntimeError("Invalid operands for binary operation, got " + lhs.type + " and " + rhs.type);
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
            throw new RuntimeError("Unknown operator");
    }
}

export function evalComEx(comop: CompareExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(comop.lhs, env);
    const rhs = evaluate(comop.rhs, env);

    if (lhs.type !== "number" || rhs.type !== "number") {
        throw new RuntimeError("Invalid operands for comparison operation, got " + lhs.type + " and " + rhs.type);
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
            throw new RuntimeError("Unknown operator");
    }
}

export function evalVarAssignment(node: VarAssignmentExpr, env: Environment): RuntimeVal {
    if (node.assignee.type === "Identifier") {
        const varname = (node.assignee as Identifier).symbol;
        return env.assignVar(varname, evaluate(node.value, env));
    } else if (node.assignee.type === "MemberExpr") {
        const memberExpr = node.assignee as MemberExpr;
        const obj = evaluate(memberExpr.object, env) as ObjectVal;
        if (obj.type !== "object") {
            throw new RuntimeError("Cannot assign property of non-object (assigning properties of " + obj.type + ")");
        };

        const property = memberExpr.computed ? evaluate(memberExpr.value, env) : memberExpr.value;
        const key = property.type === "Identifier" ? (property as Identifier).symbol : (property as RuntimeVal).value.toString();
        const value = evaluate(node.value, env);

        obj.properties.set(key, value);
        return value;
    } else {
        throw new RuntimeError("Invalid assignee in assignment expression");
    }
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
        throw new RuntimeError("Cannot call non-function (calling a " + fn.type + ")");
    }

    
}

export function evalMemberExpr(expr: MemberExpr, env: Environment): RuntimeVal {
    const obj = evaluate(expr.object, env) as ObjectVal;
    if (obj.type !== "object") {
        throw new RuntimeError("Cannot access property of non-object (accessing properties of " + obj.type + ")");
    }

    const property = expr.computed ? evaluate(expr.value, env) : expr.value;
    const key = property.type === "Identifier" ? (property as Identifier).symbol : (property as RuntimeVal).value.toString();

    if (!obj.properties.has(key)) {
        // throw new RuntimeError(`Cannot resolve property ${key}`);

        return MK_NIL();
    }

    return obj.properties.get(key) as RuntimeVal;
}
