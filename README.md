# VirtLang Interpreter

VirtLang is a simple interpreted language designed for educational purposes. This README provides instructions on how to set up, build, and run the VirtLang interpreter.

## Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your machine. You can download them from [Node.js official website](https://nodejs.org/).

### Installation

Clone the repository and install the dependencies:

```sh
mkdir myVirtLangProject && cd MyVirtLangProject
npm install @kasz/virtlang
```

## Usage

Create a `.vl` file with your VirtLang code. For example, `main.vl`:

```plaintext
--> i am a comment

out.print("Hello world this is some message")

--> i am another comment

--<
some comments
out.error("Error here")
out.warn("Hello world this is a warning")
>--

out.print("Hello world this is some message 22")
```

Create a `main.js` file with the following code:

```js
const { Parser, createGlobalEnv, evaluate } = require("@kasz/virtlang");
const { readFileSync } = require("fs");

const code = readFileSync("main.vl", "utf-8");

const parser = new Parser();
const env = createGlobalEnv();

const ast = parser.produceAST(code);
evaluate(ast, env);
```

Run the interpreter:

```sh

node main.js

```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
