export type NodeType = 
    | "Program"
    | "VarDeclaration"
    | "FnDeclaration"
    | "IfStatement"
    | "WhileLoop"
    | "VarAssignmentExpr"
    | "MemberExpr"
    | "CallExpr"
    | "Property"
    | "ObjectLiteral"
    | "NumericLiteral"
    | "StringLiteral"
    | "Identifier"
    | "CompareExpr"
    | "BinaryExpr";

export interface Stmt {
    type: NodeType;
}

export interface Program extends Stmt {
    type: "Program";
    body: Stmt[];
}

export interface VarDeclaration extends Stmt {
    type: "VarDeclaration";
    constant: boolean;
    identifier: string;
    value?: Expr;
}

export interface FnDeclaration extends Stmt {
    type: "FnDeclaration";
    params: string[];
    name: string;
    body: Stmt[];
    async: boolean; // TODO
}

export interface IfStatement extends Stmt {
    type: "IfStatement";
    body: Stmt[];
    condition: Expr;
}

export interface WhileLoop extends Stmt {
    type: "WhileLoop";
    body: Stmt[];
    condition: Expr;
}

export interface Expr extends Stmt {}

export interface VarAssignmentExpr extends Expr {
    type: "VarAssignmentExpr";
    assignee: Expr,
    value: Expr;
}

export interface BinaryExpr extends Expr {
    type: "BinaryExpr";
    lhs: Expr;
    rhs: Expr;
    operator: string;
}

export interface CompareExpr extends Expr {
    type: "CompareExpr";
    lhs: Expr;
    rhs: Expr;
    operator: "<=" | "<" | "=>" | ">" | "==" | "!=";
}

export interface CallExpr extends Expr {
    type: "CallExpr";
    args: Expr[];
    callee: Expr;
}

export interface MemberExpr extends Expr {
    type: "MemberExpr";
    object: Expr;
    value: Expr;
    computed: boolean;
}

export interface Identifier extends Expr {
    type: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends Expr {
    type: "NumericLiteral";
    value: number;
}

export interface StringLiteral extends Expr {
    type: "StringLiteral";
    value: string;
}

export interface Property {
    type: "Property";
    key: string;
    value?: Expr;
}

export interface ObjectLiteral extends Expr {
    type: "ObjectLiteral";
    properties: Property[];
}


