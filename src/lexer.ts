export enum TokenType {
    Number,         // 0 - 9
    Identifier,     // a - z A - Z
    Equals,         // =
    BinOperator,    // / * + _
    OParen,         // (
    CParen,         // )
    Let,            // let
    Const,          // const
    SemiColon,      // ;
    Comma,          // ,
    Colon,          // :
    OBrace,         // {
    CBrace,         // }
    OBracket,       // [
    CBracket,       // ]
    Dot,            // .
    Fn,             // fn
    ComOperator,    // < == > != <= =>
    If,             // if
    Else,           // else // TODO
    String,         // '...' "..."
    WhileLoop,      // while
    Comment,        // --<...>-- -->...
    EOF
}

const KEYWORDS: Record<string, TokenType> = {
    "let": TokenType.Let,
    "const": TokenType.Const,
    "fn": TokenType.Fn,
    "if": TokenType.If,
    "else": TokenType.Else,
    "while": TokenType.WhileLoop,
}

export interface Token {
    value: string;
    type: TokenType;
    line: number;
    col: number;
}

function token(value = "", type: TokenType, line: number, col: number): Token {
    return { value, type, line, col };
}

function isAlpha(c: string): boolean {
    return c.toUpperCase() !== c.toLowerCase();
}

function isInt (c: string): boolean {
    // return !isNaN(parseInt(c))
    const charCode = c.charCodeAt(0);
    const bounds = [ '0'.charCodeAt(0), '9'.charCodeAt(0) ];
    return (charCode >= bounds[0] && charCode <= bounds[1]);
};

function isSkippable(c: string): boolean {
    return [" ", "\n", "\t", "\r"].includes(c);
}

export function tokenize(srcCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = srcCode.split('');

    let currentLn = 1;
    let currentCol = 0;

    while (src.length > 0) {
        currentCol++;

        if (["\n", "\r"].includes(src[0])) {
            currentLn++;
            currentCol = 0;
        }

        if (src[0] === '(') tokens.push(token(src.shift(), TokenType.OParen, currentLn, currentCol))
        else if (src[0] === ')') tokens.push(token(src.shift(), TokenType.CParen, currentLn, currentCol))
        else if (src[0] === '{') tokens.push(token(src.shift(), TokenType.OBrace, currentLn, currentCol))
        else if (src[0] === '}') tokens.push(token(src.shift(), TokenType.CBrace, currentLn, currentCol))
        else if (src[0] === '[') tokens.push(token(src.shift(), TokenType.OBracket, currentLn, currentCol))
        else if (src[0] === ']') tokens.push(token(src.shift(), TokenType.CBracket, currentLn, currentCol))
        else if ("-->" === src.slice(0, 3).join("")) {
            src.splice(0, 3);
            let comment = "";
            while (src.length > 0 && !["\n", "\r"].includes(src[0])) {
                currentCol++;
                comment += src.shift();
            }
            tokens.push(token(comment, TokenType.Comment, currentLn, currentCol))
        } else if ("--<" === src.slice(0, 3).join("")) {
            src.splice(0, 3);
            let comment = "";
            while (src.length > 0 && ">--" !== src.slice(0, 3).join("")) {
                currentCol++;
                if (["\n", "\r"].includes(src[0])) {
                    currentLn++;
                    currentCol = 0;
                }
                comment += src.shift();
            }
            src.splice(0, 3);
            tokens.push(token(comment, TokenType.Comment, currentLn, currentCol))
        }
        else if (["+", "-", "/", "*", "%"].includes(src[0])) tokens.push(token(src.shift(), TokenType.BinOperator, currentLn, currentCol))
        else if (["==", "!=", "<=", "=>"].includes(src.slice(0, 2).join(""))) tokens.push(token([src.shift(), src.shift()].join(""), TokenType.ComOperator, currentLn, currentCol))
        else if (["<", ">"].includes(src[0])) tokens.push(token([src.shift()].join(""), TokenType.ComOperator, currentLn, currentCol))
        else if (src[0] === "=") tokens.push(token(src.shift(), TokenType.Equals, currentLn, currentCol))
        // else if (src[0] === ";") tokens.push(token(src.shift(), TokenType.SemiColon, currentLn, currentCol))
        else if (src[0] === ":") tokens.push(token(src.shift(), TokenType.Colon, currentLn, currentCol))
        else if (["'", "\""].includes(src[0])) {
            let str = "";
            const quote = src.shift();
            while (src.length > 0) {
                currentCol++;

                str += src.shift();
                if (src[0] === quote) {
                    src.shift();
                    break;
                }
            }
            tokens.push(token(str, TokenType.String, currentLn, currentCol))
        }
        else if (src[0] === ",") tokens.push(token(src.shift(), TokenType.Comma, currentLn, currentCol))
        else if (src[0] === ".") tokens.push(token(src.shift(), TokenType.Dot, currentLn, currentCol))
        else if (src[0] === " ") src.shift()
        else {
            if (isInt(src[0])) {
                let num = "";
                while (src.length > 0 && isInt(src[0])) {
                    num += src.shift();
                    currentCol++;
                }
                tokens.push(token(num, TokenType.Number, currentLn, currentCol));
            } else if (isAlpha(src[0])) {
                let id = "";
                while (src.length > 0 && isAlpha(src[0])) {
                    id += src.shift();
                    currentCol++;
                }
                
                const reserved = KEYWORDS[id];
                if (typeof reserved === "number") {
                    tokens.push(token(id, reserved, currentLn, currentCol));
                } else {
                    tokens.push(token(id, TokenType.Identifier, currentLn, currentCol));
                }
            } else if (isSkippable(src[0])) {
                src.shift();
            } else {
                console.error(`Unexpected character: ${src[0]} at ${currentLn}:${currentCol-1}`);
                process.exit(1);
            }
        }
    }

    tokens.push(token("EOF", TokenType.EOF, currentLn, currentCol));

    return tokens;
}
