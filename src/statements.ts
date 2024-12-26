import { FnDeclaration, IfStatement, Program, VarDeclaration, WhileLoop } from "./ast.js";
import Environment from "./environment.js";
import { evaluate } from "./interpreter.js";
import { FunctionValue, MK_NIL, RuntimeVal } from "./values.js";

export function evalProgram(program: Program, env: Environment): RuntimeVal {
    let result: RuntimeVal = MK_NIL();

    for (const stmt of program.body) {
        result = evaluate(stmt, env);
    }

    return result;
}

export function evalVarDecl(varDecl: VarDeclaration, env: Environment): RuntimeVal {
    const value = varDecl.value ? evaluate(varDecl.value, env) : MK_NIL();
    return env.declareVar(varDecl.identifier, value, varDecl.constant);
}

export function evalFnDecl(declaration: FnDeclaration, env: Environment): RuntimeVal {
    const fn = {
        type: "function",
        name: declaration.name,
        params: declaration.params,
        declarationEnv: env,
        body: declaration.body,
    } as FunctionValue;

    if (declaration.anonymous) {
        return fn;
    } else {
        return env.declareVar(declaration.name, fn, true);
    }
}

export function evalIfStmt(statement: IfStatement, env: Environment): RuntimeVal {
    const ifStmt = {
        type: "IfStatement",
        // declarationEnv: env,
        body: statement.body,
        condition: statement.condition
    } as IfStatement;

    const conditionSatisfied = evaluate(statement.condition, env);
    if (conditionSatisfied.type === "boolean" && conditionSatisfied.value) {
        for (const stmt of statement.body) {
            evaluate(stmt, new Environment(env));
        }
    }

    return MK_NIL();
}

export function evalWhileLoop(statement: WhileLoop, env: Environment): RuntimeVal {
    const s = {
        type: "WhileLoop",
        // declarationEnv: env,
        body: statement.body,
        condition: statement.condition
    } as WhileLoop;

    while (evaluate(statement.condition, env).type === "boolean" && evaluate(statement.condition, env).value) {
        for (const stmt of statement.body) {
            evaluate(stmt, new Environment(env));
        }
    }

    return MK_NIL();
}
