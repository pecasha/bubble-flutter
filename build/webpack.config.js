"use strict";
const path = require("path");
const webpack = require("webpack");
const uglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    entry: {
        app: "./src/main.js"
    },
    output: {
        path: path.resolve(__dirname, "../lib"),
        publicPath: "/",
        filename: "bubble-flutter.js",
        library: "BubbleFlutter",
        libraryTarget: "umd",
        libraryExport: "default",
        umdNamedDefine: true
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: "'production'"
            }
        }),
        new uglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false,
                    drop_debugger: true,
                    drop_console: true
                }
            },
            parallel: true
        })
    ],
    resolve: {
        extensions: [".js"]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loaders: [
                    "babel-loader",
                    {
                        loader: "eslint-loader",
                        options: {
                            formatter: require("eslint-friendly-formatter"),
                            emitWarning: false
                        }
                    }
                ],
                enforce: "pre",
                exclude: /node_modules/
            }
        ]
    }
};