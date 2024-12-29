import { expect, describe, it } from "@jest/globals"

import { Environment, evaluate, Parser, MK_NUMBER, MK_OBJECT, MK_NATIVE_FN } from "../../src/index";

describe("object type", () => {
    const env = new Environment();
    it("should evaluate object and function correctly", () => {
        const parser = new Parser();
        const program = parser.produceAST(`
            let my_Obj = {
            a: 10,
            b: 20,
            sum: fn() {
                my_Obj.a + my_Obj.b
            },
            subtract: fn () {
                my_Obj.a - my_Obj.b
            }
        }`);
        const result = evaluate(program, env);
        expect(result.type).toBe("object");
    });

    it("should not throw error", () => {
        const parser = new Parser();
        const program = parser.produceAST(`
            my_Obj.a = 40
            my_Obj["b"] = 10
        `);
        expect(() => evaluate(program, env)).not.toThrowError();
    });

    it("should throw error", () => {
        const parser = new Parser();
        const program = parser.produceAST(`obj.a()`);
        expect(() => evaluate(program, env)).toThrowError();
    });

    it("should make object", () => {
        expect(MK_OBJECT({
            a: MK_NUMBER(199),
            b: MK_NUMBER(249)
        })).toHaveProperty("properties");
    })
})
