const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/main.ts',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: "main.js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    stats: {
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /grammar.js$/,
                loader: 'string-replace-loader',
                options: {
                    multiple: [
                        { search: 'fs.readFileSync(require.resolve("../include/module.js', replace: 'fs.readFileSync(path.resolve(__dirname,"./jsonpath/include/module.js' },
                        { search: 'fs.readFileSync(require.resolve("../include/action.js', replace: 'fs.readFileSync(path.resolve(__dirname,"./jsonpath/include/action.js' },
                        { search: 'var fs = require(\'fs\')', replace: 'var fs = require(\'fs\');\nvar path = require(\'path\');' }
                    ],
                }
            },
            {
                test: /aesprim.js$/,
                loader: 'string-replace-loader',
                options: {
                    multiple: [
                        { search: 'var file = require.resolve(\'esprima\')', replace: 'var file = path.resolve(__dirname,\'./esprima/esprima.js\')' },
                        { search: 'var fs = require(\'fs\')', replace: 'var fs = require(\'fs\');\nvar path = require(\'path\');' }
                    ],
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                // required node_modules for jsonpath (see https://github.com/dchester/jsonpath/search?q=require.resolve)
                { from: 'node_modules/jsonpath/include', to: 'jsonpath/include' },
                { from: 'node_modules/esprima/esprima.js', to: 'esprima/esprima.js' }
            ]
        })
    ],
};
