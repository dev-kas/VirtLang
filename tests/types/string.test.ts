import { expect, describe, it } from "@jest/globals"

import { Environment, evaluate, Parser, MK_STRING } from "../../src/index";

describe("string type", () => {
    it("should evaluate string", () => {
        const parser = new Parser();
        const program = parser.produceAST(`"hello world"`);
        const result = evaluate(program, new Environment());
        expect(result.type).toBe("string");
        expect(result.value).toBe("hello world");
    });

    it("should not throw error", () => {
        const parser = new Parser();
        const program = parser.produceAST(`'hello " to the " world'`);
        expect(() => evaluate(program, new Environment())).not.toThrowError();
    });

    it("should throw error", () => {
        const parser = new Parser();
        const program = parser.produceAST(`'hello ' + ' world'`);
        expect(() => evaluate(program, new Environment())).toThrowError();
    });

    it("should make string", () => {
        expect(MK_STRING("hello")).toEqual({ type: "string", value: "hello" });
    })
})
