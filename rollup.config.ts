import terser from '@rollup/plugin-terser';
import shebang from 'rollup-plugin-shebang-bin';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import autoExternal from 'rollup-plugin-auto-external';
import multiInput from '@ayan4m1/rollup-plugin-multi-input';

const plugins = [
  autoExternal(),
  typescript(),
  nodeResolve(),
  multiInput(),
  shebang({
    include: ['**/*.ts']
  })
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(terser());
}

export default {
  input: './src/**/*.ts',
  output: {
    dir: './lib',
    format: 'esm'
  },
  plugins
};
