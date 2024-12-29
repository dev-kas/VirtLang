import { expect, describe, it } from "@jest/globals";

import { createGlobalEnv, evaluate, MK_BOOL, MK_NIL, Parser } from "../../src/index";

describe("functions", () => {
    it("should return 'Hello world!'", () => {
        const env = createGlobalEnv();
        const parser = new Parser();
        const ast = parser.produceAST(`
            fn func() {
                5 + 6
                return "Hello world!"
                4 + 5
            }
            func()`);
        const result = evaluate(ast, env);
        expect(result.type).toBe("string");
        expect(result.value).toBe("Hello world!");
    });

    it("should return 5!", () => {
        const env = createGlobalEnv();
        const parser = new Parser();
        const ast = parser.produceAST(`
            fn factorial(n) {
                if (n == 0) {
                    return 1
                }
                n * factorial(n - 1)
            }
            factorial(5)
        `);
        const result = evaluate(ast, env);
        expect(result.type).toBe("number");
        expect(result.value).toBe(120);
    });
});
