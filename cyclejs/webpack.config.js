/*eslint-env node*/
var HtmlWebpackPlugin = require('html-webpack-plugin');

var isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './client/index.js',
  devtool: (isDev? 'inline-' : '') + 'source-map',
  output: {
    path: 'dist',
    filename: 'client.js',
    publicPath: '/',
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
  devServer: {
    stats: {chunks: false},
    historyApiFallback: true,
    contentBase: 'dist',
    proxy: {'/api/*': {target: 'http://localhost:8081'}},
  },
};
