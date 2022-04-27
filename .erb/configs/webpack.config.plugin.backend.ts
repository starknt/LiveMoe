import baseConfig from './webpack.config.base';
import { merge } from 'webpack-merge';
import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import path from 'path';
import webpackPlugin from './webpack.plugin';

const config: webpack.Configuration = {
  mode: 'production',

  devtool: false,

  target: 'electron-main',

  entry: webpackPlugin.backendEntries,

  output: {
    publicPath: '/',
    path: path.join(webpackPaths.rootPath, 'plugins'),
    filename: '[name]/dist/[name].backend.js',
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
};

export default merge(baseConfig, config);
