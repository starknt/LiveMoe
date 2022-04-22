import baseConfig from './webpack.config.base';
import { merge } from 'webpack-merge';
import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

const config: webpack.Configuration = {
  devtool: false,
  target: 'electron-renderer',
  entry: {
    service: path.join(webpackPaths.srcPreloadPath, 'service.ts'),
    wallpaper: path.join(webpackPaths.srcPreloadPath, 'wallpaper.ts'),
  },

  output: {
    publicPath: '/',
    path: path.join(webpackPaths.distMainPath),
    filename: '[name].js',
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
      }),
    ],
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
