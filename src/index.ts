import { Parser } from './parser.js';
// import rs from 'readline-sync';
// import { readFileSync } from 'node:fs';
import Environment, { createGlobalEnv } from './environment.js';
import { evaluate } from './interpreter.js';
import { MK_BOOL, MK_NATIVE_FN, MK_NIL, MK_NUMBER, MK_OBJECT, MK_STRING } from './values.js';

export {
    createGlobalEnv, Environment, evaluate, MK_BOOL, MK_NATIVE_FN, MK_NIL,
    MK_NUMBER, MK_OBJECT,
    MK_STRING, Parser
};

// import { readFileSync } from 'node:fs';

// function repl(env = createGlobalEnv()) {
//     const parser = new Parser();

//     // env.declareVar("x", MK_NUMBER(5));

//     console.log(`Welcome to the VirtLang REPL v0.1.0!`);
//     while (true) {
//         const input = rs.question(">>> ");
//         if (!input) continue
//         else if (input === "exit") process.exit(0);

//         const program = parser.produceAST(input);
//         // console.dir(program, { depth: null, colors: true });
//         const result = evaluate(program, env);
//         console.dir(result.value ?? (result as any).properties, { depth: null, colors: true });
//     }
// }

// function start(r = false) {
//     const parser = new Parser();
//     const env = createGlobalEnv();

//     const input = readFileSync('./src/tmp.vl', 'utf-8');

//     const program = parser.produceAST(input);
//     console.dir(program, { depth: null, colors: true });
//     const result = evaluate(program, env);
//     // console.log(`Result: ${JSON.stringify(result, null, 2)}`);

//     // if (r) repl(env);
// }

// start(false);
// // repl();


