/*eslint-env node*/
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './client/index.js',
  output: {
    path: 'dist',
    filename: 'client.js',
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html',
      hash: true,
      minify: {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      },
    }),
  ],
};
