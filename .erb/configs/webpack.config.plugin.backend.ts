import baseConfig from './webpack.config.base';
import { merge } from 'webpack-merge';
import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import webpackPlugin from './webpack.plugin';
import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';

let movePlugin = []

if(process.env.NODE_ENV !== 'development') {
  let move = Object.values(webpackPlugin.packagesPath).map(config => ({
        from: config.path,
        to: path.join(webpackPaths.pluginPathProduction, config.name),
        force: true,
      }))
  movePlugin = [
    new CopyPlugin({
      patterns: move,
    }),
  ]
}


const config: webpack.Configuration = {
  mode: 'production',

  devtool: false,

  target: 'electron-main',

  entry: webpackPlugin.backendEntries,

  output: {
    publicPath: '/',
    path: process.env.NODE_ENV === 'development' ? webpackPaths.pluginPath : webpackPaths.pluginPathProduction,
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

    ...movePlugin,
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  watch: process.env.NODE_ENV === 'development',
};

export default merge(baseConfig, config);
