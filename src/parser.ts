import { Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier, VarDeclaration, VarAssignmentExpr, Property, ObjectLiteral, CallExpr, MemberExpr, FnDeclaration, CompareExpr, IfStatement, StringLiteral, WhileLoop } from "./ast.js";
import { tokenize, Token, TokenType } from "./lexer.js";

export default class Parser {
    private tokens: Token[] = [];

    private at(): Token {
        return this.tokens[0];
    }

    private advance(): Token {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect(type: TokenType, msg: any): Token {
        const prev = this.tokens.shift();
        if (!prev || prev.type !== type) {
            console.error("Parser error: ", msg, prev, "Expected:", type);
            process.exit(1);
        }
        return prev;
    }

    private isEOF(): boolean {
        return this.at().type === TokenType.EOF;
    }

    public produceAST(srcCode: string): Program {
        this.tokens = tokenize(srcCode);

        const program: Program = {
            type: "Program",
            body: []
        };

        while (!this.isEOF()) {
            program.body.push(this.parseStmt());
        }

        return program;
    }

    private parseStmt(): Stmt {
        // return this.parseExpr();
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parseVarDecl();
            case TokenType.Fn:
                return this.parseFnDecl();
            case TokenType.If:
                return this.parseIfStmt();
            default:
                return this.parseExpr();
        }
    }

    private parseIfStmt(): Stmt {
        this.advance(); // if

        this.expect(TokenType.OParen, "Error Parsing: Expected '(', got: " + this.at().value);
        const condition = this.parseExpr();
        this.expect(TokenType.CParen, "Error Parsing: Expected ')', got: " + this.at().value);

        this.expect(TokenType.OBrace, "Error Parsing: Expected '{', got: " + this.at().value);

        const body: Stmt[] = [];

        while (!this.isEOF() && this.at().type !== TokenType.CBrace) {
            body.push(this.parseStmt());
        }

        this.expect(TokenType.CBrace, "Error Parsing: Expected '}', got: " + this.at().value);

        const statement = {
            type: "IfStatement",
            body,
            condition
        } as IfStatement;

        return statement;
    }

    private parseFnDecl(): Stmt {
        this.advance(); // fn

        const name = this.expect(TokenType.Identifier, "Error Parsing: Expected identifier, got: " + this.at().value).value;
        const args = this.parseArgs();
        const params: string[] = [];

        for (const arg of args) {
            if (arg.type !== "Identifier") {
                console.error("Error Parsing: Expected identifier, got: " + arg.type);
                process.exit(1);
            }
            params.push((arg as Identifier).symbol);
        }

        this.expect(TokenType.OBrace, "Error Parsing: Expected '{', got: " + this.at().value);

        const body: Stmt[] = [];

        while (!this.isEOF() && this.at().type !== TokenType.CBrace) {
            body.push(this.parseStmt());
        }

        this.expect(TokenType.CBrace, "Error Parsing: Expected '}', got: " + this.at().value);

        const fn = {
            type: "FnDeclaration",
            params,
            name,
            body,
            async: false
        } as FnDeclaration;

        return fn;
    }

    private parseVarDecl(): Stmt {
        const isConstant = this.advance().type === TokenType.Const;
        const id = this.expect(TokenType.Identifier, "Error Parsing: Expected identifier, got: " + this.at().value).value;

        this.expect(TokenType.Equals, "Error Parsing: Expected '=', got: " + this.at().value);
        const declaration = {
            type: "VarDeclaration",
            constant: isConstant,
            identifier: id,
            value: this.parseExpr()
        }

        // this.expect(TokenType.SemiColon, "Error Parsing: Expected ';', got: " + this.at().value);
        return declaration as VarDeclaration;
    }

    private parseExpr(): Expr {
        return this.parseAssignmentExpr();
    }

    private parseAssignmentExpr(): Expr {
        const lhs = this.parseComparisonExpr();

        if (this.at().type === TokenType.Equals) {
            this.advance();
            const value = this.parseAssignmentExpr();
            return { value, assignee: lhs, type: "VarAssignmentExpr" } as VarAssignmentExpr;
        }

        return lhs;
    }

    private parseComparisonExpr(): Expr {
        const lhs = this.parseObjectExpr();

        if (this.at().type === TokenType.ComOperator) { // <, >, <=, >=, ==, !=
            const operator = this.advance().value;
            const rhs = this.parseObjectExpr();
            return { lhs, rhs, operator, type: "CompareExpr" } as CompareExpr;
        }

        return lhs;
    }

    private parseObjectExpr(): Expr {
        if (this.at().type !== TokenType.OBrace) return this.parseAdditiveExpr();
        this.advance();

        const properties = new Array<Property>();

        while (!this.isEOF() && this.at().type !== TokenType.CBrace) {
            const key = this.expect(TokenType.Identifier, "Error Parsing: Expected identifier, got: " + this.at().value).value;

            if (this.at().type === TokenType.Comma) { // { key, }
                this.advance();
                properties.push({ key, type: "Property" } as Property);
                continue;
            } else if (this.at().type === TokenType.CBrace) { // { key }
                properties.push({ key, type: "Property" } as Property);
                break;
            }
            // { key: value }
            this.expect(TokenType.Colon, "Error Parsing: Expected ':', got: " + this.at().value);
            const value = this.parseExpr();
            properties.push({ key, value, type: "Property" } as Property);
            if (this.at().type !== TokenType.CBrace) {
                this.expect(TokenType.Comma, "Error Parsing: Expected ',', got: " + this.at().value);
            }
        }

        this.expect(TokenType.CBrace, "Error Parsing: Expected '}', got: " + this.at().value);
        return {
            type: "ObjectLiteral",
            properties
        } as ObjectLiteral;
    }

    private parseAdditiveExpr(): Expr {
        let lhs = this.parseMultiplicativeExpr();

        while (["+", "-"].includes(this.at().value)) {
            const operator = this.advance().value;
            const rhs = this.parseMultiplicativeExpr();

            lhs = {
                type: "BinaryExpr",
                lhs,
                rhs,
                operator
            } as BinaryExpr;
        }

        return lhs;
    }

    private parseMultiplicativeExpr(): Expr {
        let lhs = this.parseCallMemberExpr();

        while (["/", "*", "%"].includes(this.at().value)) {
            const operator = this.advance().value;
            const rhs = this.parseCallMemberExpr();

            lhs = {
                type: "BinaryExpr",
                lhs,
                rhs,
                operator
            } as BinaryExpr;
        }

        return lhs;
    }

    private parseCallMemberExpr(): Expr {
        const member = this.parseMemberExpr();

        if (this.at().type === TokenType.OParen) {
            return this.parseCallExpr(member);
        }

        return member;
    }
    
    private parseCallExpr(callee: Expr): Expr {
        let callExpr: Expr = {
            type: "CallExpr",
            callee,
            args: this.parseArgs()
        } as CallExpr;

        if (this.at().type === TokenType.OParen) {
            callExpr = this.parseCallExpr(callExpr);
        }

        return callExpr;
    }

    private parseArgs(): Expr[] {
        this.expect(TokenType.OParen, "Error Parsing: Expected '(', got: " + this.at().value)
        const args = this.at().type === TokenType.CParen ? [] : this.parseArgsList();

        this.expect(TokenType.CParen, "Error Parsing: Expected ')', got: " + this.at().value);
        return args;
    }

    private parseArgsList(): Expr[] {
        const args = [ this.parseAssignmentExpr() ];

        while (this.at().type === TokenType.Comma && this.advance()) {
            args.push(this.parseAssignmentExpr());
        }

        return args;
    }

    private parseMemberExpr(): Expr {
        let obj = this.parsePrimaryExpr();

        while ([TokenType.Dot, TokenType.OBracket].includes(this.at().type)) {
            const operator = this.advance();
            let property: Expr;
            let computed: boolean;

            if (operator.type === TokenType.Dot) {
                computed = false;
                property = this.parsePrimaryExpr();

                if (property.type !== "Identifier") {
                    console.error("Error Parsing: Expected identifier after '.', got: " + this.at().value);
                    process.exit(1);
                }
            } else {
                computed = true;
                property = this.parseExpr();

                this.expect(TokenType.CBracket, "Error Parsing: Expected ']', got: " + this.at().value);
            }

            obj = {
                type: "MemberExpr",
                object: obj,
                value: property,
                computed
            } as MemberExpr;
        }

        return obj;
    }

    private parseArrayLiteral(): Expr {
        this.advance(); // [

        const elements: Expr[] = [];

        while (!this.isEOF() && this.at().type !== TokenType.CBracket) {
            elements.push(this.parseExpr());

            if (this.at().type === TokenType.Comma) {
                this.advance();
            }
        }

        this.expect(TokenType.CBracket, "Error Parsing: Expected ']', got: " + this.at().value);

        const properties: Property[] = [];

        for (let i = 0; i < elements.length; i++) {
            properties.push({ key: i.toString(), value: elements[i], type: "Property" } as Property);
        }

        return {
            type: "ObjectLiteral",
            properties
        } as ObjectLiteral;
    }

    private parseWhileLoop(): Expr {
        this.advance();

        this.expect(TokenType.OParen, "Error Parsing: Expected '(', got: " + this.at().value);
        const condition = this.parseExpr();
        this.expect(TokenType.CParen, "Error Parsing: Expected ')', got: " + this.at().value);

        this.expect(TokenType.OBrace, "Error Parsing: Expected '{', got: " + this.at().value);
        const body: Stmt[] = [];

        while (!this.isEOF() && this.at().type !== TokenType.CBrace) {
            body.push(this.parseStmt());
        }
        this.expect(TokenType.CBrace, "Error Parsing: Expected '}', got: " + this.at().value);

        return {
            type: "WhileLoop",
            condition,
            body
        } as WhileLoop;
    }

    private parsePrimaryExpr(): Expr {
        const tk = this.at().type;
        let value;
        switch (tk) {
            case TokenType.Identifier:
                return { type: "Identifier", symbol: this.advance().value } as Identifier;
            case TokenType.Number:
                return { type: "NumericLiteral", value: parseFloat(this.advance().value) } as NumericLiteral;
            case TokenType.OParen:
                this.advance();
                value = this.parseExpr();
                this.expect(TokenType.CParen, "Expected closing parenthesis");
                return value;
            case TokenType.OBracket:
                return this.parseArrayLiteral();
            case TokenType.String:
                value = this.advance().value;
                return { type: "StringLiteral", value } as StringLiteral;
            case TokenType.WhileLoop:
                return this.parseWhileLoop();
            case TokenType.Comment:
                this.advance();
                return this.parseExpr();
            default:
                console.error(`Unexpected token to parse: ${this.at().value} at ${this.at().line}:${this.at().col}`);
                process.exit(1);
        }
    }
}