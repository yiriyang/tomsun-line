import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const isWatch = process.argv.includes('-w');

export default [
  // Core package
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'esm'
      },
      {
        file: 'dist/index.js',
        format: 'cjs'
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ],
    external: ['react', 'vue']
  },
  // React adapter
  {
    input: 'src/adapters/React/index.ts',
    output: [
      {
        file: 'dist/adapters/React/index.esm.js',
        format: 'esm'
      },
      {
        file: 'dist/adapters/React/index.js',
        format: 'cjs'
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ],
    external: ['react', 'react-dom']
  },
  // Vue adapter
  {
    input: 'src/adapters/Vue/index.ts',
    output: [
      {
        file: 'dist/adapters/Vue/index.esm.js',
        format: 'esm'
      },
      {
        file: 'dist/adapters/Vue/index.js',
        format: 'cjs'
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ],
    external: ['vue']
  },
  // Type definitions - only in build mode, not watch mode
  ...(isWatch ? [] : [
    {
      input: 'dist/index.d.ts',
      output: {
        file: 'dist/index.d.ts',
        format: 'esm'
      },
      plugins: [dts()]
    },
    {
      input: 'dist/adapters/React/index.d.ts',
      output: {
        file: 'dist/adapters/React/index.d.ts',
        format: 'esm'
      },
      plugins: [dts()]
    },
    {
      input: 'dist/adapters/Vue/index.d.ts',
      output: {
        file: 'dist/adapters/Vue/index.d.ts',
        format: 'esm'
      },
      plugins: [dts()]
    }
  ])
];
