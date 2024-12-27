import { expect, describe, it } from "@jest/globals";

import { Environment, evaluate, MK_BOOL, MK_NIL, Parser } from "../../src/index";

describe("if statement", () => {
    it("should evaluate if statement", () => {
        const env = new Environment();
        env.declareVar("true", MK_BOOL(true), true);
        const parser = new Parser();
        const ast = parser.produceAST(`
            let var = 500
            if (true) { var = 1 }
            var`);
        const result = evaluate(ast, env);
        expect(result.type).toBe("number");
        expect(result.value).toBe(1);
    });

    it("should not evaluate if statement", () => {
        const env = new Environment();
        env.declareVar("false", MK_BOOL(false), false);
        const parser = new Parser();
        const ast = parser.produceAST(`
            let var = 500
            if (false) { var = 1 }
            var
        `);
        const result = evaluate(ast, env);
        expect(result.type).toBe("number");
        expect(result.value).toBe(500);
    })
});
