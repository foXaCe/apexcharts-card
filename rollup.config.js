import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    noEmit: false,
    sourceMap: !!dev,
    inlineSources: !!dev,
  }),
  json(),
  dev && serve(serveopts),
  !dev &&
    terser({
      ecma: 2022,
      module: true,
      compress: {
        passes: 2,
      },
      format: {
        comments: false,
      },
    }),
].filter(Boolean);

export default [
  {
    input: 'src/apexcharts-card.ts',
    output: {
      file: './dist/apexcharts-card.js',
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: dev ? 'inline' : false,
    },
    plugins,
    watch: {
      exclude: 'node_modules/**',
    },
  },
];
