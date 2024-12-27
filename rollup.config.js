import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: './dist/index.js',
  output: {
    file: 'out/index.js',
    format: 'umd',
    name: 'VirtLang',
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
    commonjs(),
    terser(),
  ],
};
