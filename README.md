# VirtLang Interpreter

VirtLang is a simple interpreted language designed for educational purposes. This README provides instructions on how to set up, build, and run the VirtLang interpreter.

## Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your machine. You can download them from [Node.js official website](https://nodejs.org/).

### Installation

Clone the repository and install the dependencies:

```sh
git clone https://github.com/dev-kas/VirtLang.git MyVirtLangProject
cd MyVirtLangProject
npm install
```

### Building the Project

To build the project, run:

```sh
npm run build
```

### Running the Interpreter

To start the interpreter, run:

```sh
npm run start
```

### Development Mode

For development purposes, you can use the following command to build and start the project in watch mode:

```sh
npm run dev
```

## Usage

Create a `.vl` file with your VirtLang code. For example, `src/tmp.vl`:

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

Run the interpreter to execute your VirtLang code.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
