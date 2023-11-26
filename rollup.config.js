// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

const packageJson = require("./package.json");

export default [{
    input: 'src/index.ts',
    output: [{
        file: packageJson.main,
        format: 'cjs',
        name: 'YourLibrary',
        sourcemap: true,
    },
    ],
    plugins: [
        resolve(),
        commonjs(),
        json(),
        typescript(),
        terser(),
    ],
}
];