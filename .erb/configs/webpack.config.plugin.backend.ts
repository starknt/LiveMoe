import baseConfig from './webpack.config.base';
import { merge } from 'webpack-merge';
import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import webpackPlugin from './webpack.plugin';

const config: webpack.Configuration = {
  mode: 'production',

  devtool: false,

  target: 'electron-main',

  entry: webpackPlugin.backendEntries,

  output: {
    publicPath: '/',
    path: webpackPaths.pluginPath,
    filename: '[name]/dist/[name].backend.js',
    library: {
      type: 'commonjs2',
    }
  },

  externals: ['win-func-tools'],

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  watch: process.env.NODE_ENV === 'development',
};

export default merge(baseConfig, config);
