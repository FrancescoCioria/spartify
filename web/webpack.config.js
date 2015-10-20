var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpackBase = require('./webpack.base');
var assign = require('lodash/object').assign;
var indexHtml = require('fs').readFileSync(path.resolve(__dirname, './src/index.html'), 'utf8');

var paths = {
  SRC: path.resolve(__dirname, './src'),
  DIST: path.resolve(__dirname, './lib')
};

module.exports = assign({}, webpackBase, {

  entry: [
    'webpack/hot/dev-server',
    paths.SRC + '/app.js'
  ],

  devtool: 'source-map',

  devServer: {
    contentBase: paths.DIST,
    hot: true,
    inline: true,
    port: '8080'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new HtmlWebpackPlugin({ bundle: false, templateContent: indexHtml })
  ],

  module: assign({}, webpackBase.module, {
    loaders: webpackBase.module.loaders.concat([
      // style!css loaders
      {
        test: /\.css?$/,
        loaders: ['style', 'css'],
        // include: [paths.SRC]
      },
      // SASS loaders
      {
        test: /\.scss?$/,
        loaders: ['style', 'css', 'sass?sourceMap'],
        // include: [paths.SRC]
      }
    ])
  })

});
