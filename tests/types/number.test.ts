import { expect, describe, it } from "@jest/globals";

import { Environment, evaluate, Parser, MK_NUMBER } from "../../src/index";

describe("number type", () => {
    it("should evaluate number", () => {
        const parser = new Parser();
        const program = parser.produceAST(`433`);
        const result = evaluate(program, new Environment());
        expect(result.type).toBe("number");
        expect(result.value).toBe(433);
    });

    it("should not throw error", () => {
        const parser = new Parser();
        const program = parser.produceAST(`423 + 43`);
        expect(() => evaluate(program, new Environment())).not.toThrowError();
    });

    it("should throw error", () => {
        const parser = new Parser();
        const program = parser.produceAST(`"hello " + 43`);
        expect(() => evaluate(program, new Environment())).toThrowError();
    });

    it("should make number", () => {
        expect(MK_NUMBER(199)).toEqual({ type: "number", value: 199 });
    })
})
