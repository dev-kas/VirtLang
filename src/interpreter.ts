import { BinaryExpr, CallExpr, CompareExpr, FnDeclaration, Identifier, IfStatement, MemberExpr, NumericLiteral, ObjectLiteral, Program, ReturnStmt, Stmt, StringLiteral, TryCatchStmt, VarAssignmentExpr, VarDeclaration, WhileLoop } from "./ast";
import Environment from "./environment";
import { ParserError } from "./errors";
import { evalBinEx, evalCallExpr, evalComEx, evalIdentifier, evalMemberExpr, evalObjectExpr, evalVarAssignment } from "./expressions";
import { evalFnDecl, evalIfStmt, evalProgram, evalTryCatch, evalVarDecl, evalWhileLoop, evalReturnStmt } from "./statements";
import { MK_NUMBER, MK_STRING, RuntimeVal } from "./values";

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
        case "TryCatchStmt":
            return evalTryCatch(astNode as TryCatchStmt, env);
        case "ReturnStmt":
            return evalReturnStmt(astNode as ReturnStmt, env);
        default:
            console.dir(astNode, { depth: null, color: true });
            throw new ParserError(`Unknown AST node type: ${astNode.type}`);
    }
}
