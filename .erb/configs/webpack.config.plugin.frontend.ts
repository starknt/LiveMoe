import baseConfig from './webpack.config.base';
import { merge } from 'webpack-merge';
import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import webpackPlugin from './webpack.plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const config: webpack.Configuration = {
  mode: 'production',

  devtool: false,

  target: 'web',

  entry: webpackPlugin.frontendEntries,

  output: {
    publicPath: '../../',
    path: webpackPaths.pluginPath,
    filename: '[name]/dist/[name].frontend.js',
    library: {
      type: 'umd',
    }
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
        include: /\.css$/,
      },
      {
        test: /\.css$/,
        use: ['sass-loader'],
        include: /\.scss$/,
      },
      //Font Loader
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(ico|gif|png|jpg|jpeg|webp)$/,
        type: 'asset/resource',
      }
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),

    new MiniCssExtractPlugin({
      filename: '[name]/dist/[contenthash].css',
    }),

    ...webpackPlugin.htmlEntries,
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  watch: process.env.NODE_ENV === 'development',
};

export default merge(baseConfig, config);
