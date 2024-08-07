const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path');
const dotenv = require('dotenv');

// Load .env file variables
const env = dotenv.config().parsed;

// Reduce it to a nice object, the keys of which will be the env variable names prefixed with 'process.env.'
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});


module.exports = {
    mode: 'development', // mode of development
    devtool: 'inline-source-map',
    entry: './src/index.tsx', // entry file
    module: {
        rules: [
           { 
              test: /\.js$/, // apply to all JS files
              exclude: /node_modules/, // exclude all files found on node_modules
              use: {
                loader: 'babel-loader', // use this loader
              }
            },
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/
            },
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
            },
            {
              test: /\.(png|svg|jpg|jpeg|gif)$/i,
              type: 'asset/resource'
            },
            {
              test: /\.m?js/,
              resolve: {
                fullySpecified: false,
              },
          }
        ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"), // You may need additional polyfills
        "assert": require.resolve("assert/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url/"),
        "vm": false,
        "buffer": require.resolve("buffer/"), // Include other polyfills if needed
        "process": require.resolve("process/browser") // Polyfill for `process`
      },
      alias: {
        process: "process/browser",
      }
    },
    output: {
        path: path.resolve(__dirname, 'dist'), //path to output the build file
        filename: 'bundle.js' //name of build file
    },
    plugins:[
      new HtmlWebpackPlugin({
        template: "public/index.html" // create a template
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      }),
      new webpack.DefinePlugin(envKeys),
    ],
    devServer: {
      host: 'localhost', // where to run
      historyApiFallback: true,
      port: 3000, //given port to exec. app
      open: true,  // open new tab
    }
}