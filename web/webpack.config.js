var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpackBase = require('./webpack.base');
var assign = require('lodash/object').assign;
var indexHtml = require('fs').readFileSync(path.resolve(__dirname, './src/index.html'), 'utf8');

indexHtml = indexHtml.replace('__GZIP__', '');

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
    host: '0.0.0.0',
    port: '8080'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new HtmlWebpackPlugin({ bundle: false, templateContent: indexHtml }),
    new ExtractTextPlugin('style', 'style.[hash].min.css')
  ],

  module: assign({}, webpackBase.module, {
    loaders: webpackBase.module.loaders.concat([
      // style!css loaders
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css')
      },
      // SASS
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap!sass?sourceMap')
      }
    ])
  })

});
