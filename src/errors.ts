export class RuntimeError extends Error {
    constructor(message: string) {
        super(`${message}`);
        this.name = "RuntimeError";
    }
}

export class SyntaxError extends Error {
    constructor(message: string, ln: number, col: number) {
        super(`${message} at line ${ln}, col ${col}`);
        this.name = "SyntaxError";
    }
}

export class ParserError extends Error {
    constructor(message: string, ln?: number, col?: number) {
        super(`${message} ${ln ? `at line ${ln}, col ${col}` : ""}`);
        this.name = "ParserError";
    }
}

export class LexerError extends Error {
    constructor(message: string, ln: number, col: number) {
        super(`${message} at line ${ln}, col ${col}`);
        this.name = "LexerError";
    }
}
