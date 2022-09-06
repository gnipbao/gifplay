import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const extensions = ['.ts']
const noDeclarationFiles = { compilerOptions: { declaration: false } }

// const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(/^[^0-9]*/, '')

const external = [...Object.keys(pkg.dependencies || {})].map(name => RegExp(`^${name}($|/)`))

export default defineConfig([
  // CommonJS
  {
    input: 'src/index.ts',
    output: { file: 'dist/lib/gifplay.js', format: 'cjs', indent: false },
    external,
    plugins: [
      typescript({ useTsconfigDeclarationDir: true }),
      commonjs(),
      resolve({
        extensions
      }),
      babel({
        extensions,
        plugins: [
          ['@babel/plugin-transform-runtime'],
          ['@babel/plugin-proposal-class-properties'],
          ['./scripts/mangleErrors.js', { minify: false }]
        ],
        babelHelpers: 'runtime'
      })
    ]
  },

  // ES
  {
    input: 'src/index.ts',
    output: { file: 'dist/es/gifplay.js', format: 'es', indent: false },
    external,
    plugins: [
      typescript({ tsconfigOverride: noDeclarationFiles }),
      commonjs(),
      resolve({
        extensions
      }),
      babel({
        extensions,
        plugins: [
          ['@babel/plugin-transform-runtime', { useESModules: true }],
          ['@babel/plugin-proposal-class-properties'],
          ['./scripts/mangleErrors.js', { minify: false }]
        ],
        babelHelpers: 'runtime'
      })
    ]
  },

  // ES for Browsers
  {
    input: 'src/index.ts',
    output: { file: 'dist/es/gifplay.mjs', format: 'es', indent: false },
    plugins: [
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      commonjs(),
      resolve({
        extensions
      }),
      typescript({ tsconfigOverride: noDeclarationFiles }),
      babel({
        extensions,
        exclude: 'node_modules/**',
        plugins: [
          ['@babel/plugin-proposal-class-properties'],
          ['./scripts/mangleErrors.js', { minify: true }]
        ],
        skipPreflightCheck: true,
        babelHelpers: 'bundled'
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true
        }
      })
    ]
  },

  // UMD Development
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/gifplay.js',
      format: 'umd',
      name: 'GifPlay',
      indent: false
    },
    plugins: [
      typescript({ tsconfigOverride: noDeclarationFiles }),
      commonjs(),
      resolve({
        extensions
      }),
      babel({
        extensions,
        exclude: 'node_modules/**',
        plugins: [
          ['@babel/plugin-proposal-class-properties'],
          ['./scripts/mangleErrors.js', { minify: false }]
        ],
        babelHelpers: 'bundled'
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  },

  // UMD Production
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/gifplay.min.js',
      format: 'umd',
      name: 'GifPlay',
      indent: false
    },
    plugins: [
      typescript({ tsconfigOverride: noDeclarationFiles }),
      commonjs(),
      resolve({
        extensions
      }),
      babel({
        extensions,
        exclude: 'node_modules/**',
        plugins: [
          ['@babel/plugin-proposal-class-properties'],
          ['./scripts/mangleErrors.js', { minify: true }]
        ],
        skipPreflightCheck: true,
        babelHelpers: 'bundled'
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true
        }
      })
    ]
  }
])
