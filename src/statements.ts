import { FnDeclaration, IfStatement, Program, ReturnStmt, TryCatchStmt, VarDeclaration, WhileLoop } from "./ast";
import Environment from "./environment";
import { evaluate } from "./interpreter";
import { FunctionValue, MK_NIL, MK_STRING, RuntimeVal } from "./values";

export function evalProgram(program: Program, env: Environment): RuntimeVal {
    let result: RuntimeVal = MK_NIL();

    for (const stmt of program.body) {
        try {
            result = evaluate(stmt, env);
        } catch (error) {
            if ((error as any).type === "ReturnStmtError") {
                return (error as any).value;
            } else {
                throw error;
            }
        }
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
        const scope = new Environment(env);
        for (const stmt of statement.body) {
            evaluate(stmt, scope);
        }
    }

    return MK_NIL();
}

export function evalWhileLoop(statement: WhileLoop, env: Environment): RuntimeVal {
    let cond = evaluate(statement.condition, env);
    while (cond.type === "boolean" && cond.value) {
        const scope = new Environment(env);
        for (const stmt of statement.body) {
            // try {
                evaluate(stmt, scope);
            // } catch (error) {
            //     if ((error as any).type === "ReturnStmtError") {
            //         return (error as any).value;
            //     } else {
            //         throw error;
            //     }
            // }
        }
        cond = evaluate(statement.condition, env);
    }

    return MK_NIL();
}

export function evalReturnStmt(statement: ReturnStmt, env: Environment): RuntimeVal {
    throw {
        type: "ReturnStmtError",
        value: evaluate(statement.value, env)
    };
}

export function evalTryCatch(statement: TryCatchStmt, env: Environment): RuntimeVal {
    try {
        const scope = new Environment(env);
        for (const stmt of statement.try) {
            evaluate(stmt, scope);
        }
    } catch (error) {
        const scope = new Environment(env);
        try {
            scope.declareVar(statement.catchVar, MK_STRING((error as Error).message), false);
        } catch (e) { // variable is already defined
            scope.assignVar(statement.catchVar, MK_STRING((error as Error).message));
        }
        for (const stmt of statement.catch) {
            evaluate(stmt, scope);
        }
    }

    return MK_NIL();
}
