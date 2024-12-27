import { expect, describe, it } from "@jest/globals";

import { Environment, evaluate, MK_BOOL, MK_NATIVE_FN, MK_NIL, Parser } from "../../src/index";
import { RuntimeVal } from "../../src/values";

describe("lambda function", () => {
    it("should return a function", () => {
        const env = new Environment();
        env.declareVar("true", MK_BOOL(true), true);
        const parser = new Parser();
        const ast = parser.produceAST(`
            fn(x, y) { x + y }`);
        const result = evaluate(ast, env);
        expect(result.type).toBe("function");
    });

    it("should evaluate automatically", () => {
        const env = new Environment();
        let myVar = 0;
        env.declareVar("save", MK_NATIVE_FN((args: RuntimeVal[], scope: Environment): RuntimeVal => {
            myVar = args[0].value;
            return MK_NIL();
        }), false);
        const parser = new Parser();
        const ast = parser.produceAST(`
            (fn () {save( 499 )})()
        `);
        const result = evaluate(ast, env);
        expect(myVar).toEqual(499);
    })
});
