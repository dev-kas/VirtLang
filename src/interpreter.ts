import { RuntimeVal, MK_NUMBER, MK_STRING, MK_NIL } from "./values.js";
import { BinaryExpr, CallExpr, CompareExpr, FnDeclaration, Identifier, IfStatement, MemberExpr, NumericLiteral, ObjectLiteral, Program, Stmt, StringLiteral, VarAssignmentExpr, VarDeclaration, WhileLoop } from "./ast.js";
import Environment from "./environment.js";
import { evalFnDecl, evalIfStmt, evalProgram, evalVarDecl, evalWhileLoop } from "./statements.js";
import { evalBinEx, evalCallExpr, evalComEx, evalIdentifier, evalObjectExpr, evalVarAssignment, evalMemberExpr } from "./expressions.js";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
    switch (astNode.type) {
        case "NumericLiteral":
            return MK_NUMBER((astNode as NumericLiteral ).value);
        case "StringLiteral":
            return MK_STRING((astNode as StringLiteral ).value);
        case "Identifier":
            return evalIdentifier(astNode as Identifier, env);
        case "ObjectLiteral":
            return evalObjectExpr(astNode as ObjectLiteral, env);
        case "CallExpr":
            return evalCallExpr(astNode as CallExpr, env);
        case "MemberExpr":
            return evalMemberExpr(astNode as MemberExpr, env);
        case "VarAssignmentExpr":
            return evalVarAssignment(astNode as VarAssignmentExpr, env);
        case "BinaryExpr":
            return evalBinEx(astNode as BinaryExpr, env);
        case "CompareExpr":
            return evalComEx(astNode as CompareExpr, env);
        case "Program":
            return evalProgram(astNode as Program, env);
        case "VarDeclaration":
            return evalVarDecl(astNode as VarDeclaration, env);
        case "FnDeclaration":
            return evalFnDecl(astNode as FnDeclaration, env);
        case "IfStatement":
            return evalIfStmt(astNode as IfStatement, env);
        case "WhileLoop":
            return evalWhileLoop(astNode as WhileLoop, env);
        default:
            console.log("Unknown AST Node:");
            console.dir(astNode, { depth: null, color: true });
            process.exit(1);
    }
}
