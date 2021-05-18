import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default {
    input: './src/cli.ts',
    output: [
        {
            banner: '#!/usr/bin/env node',
            file: './dist/CuteDevServer.js',
            format: 'cjs',
            name: 'bundle'
        },
        {
            banner: '#!/usr/bin/env node',
            file: './dist/CuteDevServer.min.js',
            format: 'cjs',
            name: 'bundle',
            plugins: [ terser() ]
        }
    ],
    external: [ 'path', 'fs', 'express', 'mime', 'ws', 'chokidar' ],
    plugins: [ typescript() ],
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
