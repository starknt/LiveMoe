import baseConfig from './webpack.config.base';
import { merge } from 'webpack-merge';
import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import path from 'path';

const config: webpack.Configuration = {
  mode: 'production',

  devtool: false,

  target: 'electron-main',

  entry: {
  },

  output: {
    publicPath: '/',
    path: path.join(webpackPaths.distMainPath),
    sourceMapFilename: '[name].js.map',
    filename: '[name].js',
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  watch: true,

  watchOptions: {
    ignored: /node_modules/,
  },
};

export default merge(baseConfig, config);
