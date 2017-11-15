const uglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './js/index.js',
  output: {
    filename: './assets/bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: [
    new uglifyJsPlugin()
  ]
};
