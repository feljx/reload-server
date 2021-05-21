import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'
import { terser } from 'rollup-plugin-terser'

export default {
    input: './src/cli.ts',
    output: [
        {
            banner: '#!/usr/bin/env node',
            file: './dist/index.js',
            format: 'cjs',
            name: 'bundle'
        },
        {
            banner: '#!/usr/bin/env node',
            file: './dist/index.min.js',
            format: 'cjs',
            name: 'bundle',
            plugins: [ terser() ]
        }
    ],
    external: [ 'path', 'fs', 'express', 'mime', 'ws', 'chokidar' ],
    plugins: [
        typescript(),
        copy({
            targets: [
                { src: 'dist_package.json', dest: 'dist', rename: 'package.json' }
            ]
        })
    ],
    watch: {
        include: 'src/**'
    }
}

// Example for replacing existing Unix shebang

// import replace from 'rollup-plugin-replace';
// export default {
//   banner: '#!/usr/bin/env node',
//   plugins: [
//     replace({
//       '#!/usr/bin/env node': ''
//     }),
//   // ...

// ALTERNATIVE CONFIG EXAMPLE

// import typescript from '@rollup/plugin-typescript';
// import { uglify } from 'rollup-plugin-uglify';

// const pkg = require('./package.json');
// const version = pkg.version;
// const isProduction = process.env.NODE_ENV !== 'development';

// export default {
//   input: ['src/main.ts'],
//   output: {
//     file: 'dist/js/bundle.js',
//     format: 'iife',
//     sourcemap: true,
//     banner: `/*! ${version} */`
//   },
//   watch: {
//     include: ['src/**'],
//     exclude: ['node_modules/**']
//   },
//   plugins: [
//     typescript(),
//     isProduction ? uglify({
//       compress: {
//         pure_funcs: [ 'console.log' ]
//       },
//       output: {
//         comments: (node, comment) => {
//           return comment.line === 1
//         }
//       }
//     }) : {}
//   ]
// };
