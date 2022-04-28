import path from 'path';
import fs from 'fs';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import webpack from 'webpack';
import chalk from 'chalk';
import { merge } from 'webpack-merge';
import { spawn, execSync } from 'child_process';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';
import UnoCSS from '@unocss/webpack';
import ReactFastRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';

if (process.env.NODE_ENV === 'production') {
  checkNodeEnv('development');
}

const port = process.env.PORT || 1212;
const manifest = path.resolve(webpackPaths.dllPath, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes(
  'webpack.config.renderer.dev.dll'
);

if (
  !requiredByDLLConfig &&
  !(fs.existsSync(webpackPaths.dllPath) && fs.existsSync(manifest))
) {
  console.warn(
    chalk.black.bgYellow.bold(
      'The DLL files are missing. Sit back while we build them for you with "npm run build-dll"'
    )
  );
  execSync('npm run postinstall');
}

const devServerConfiguration: DevServerConfiguration = {
  port,
  compress: true,
  hot: true,
  http2: true,
  headers: { 'Access-Control-Allow-Origin': '*' },
  static: {
    publicPath: '/',
  },
  historyApiFallback: {
    verbose: true,
    disableDotRule: true,
  },
  onBeforeSetupMiddleware: process.env.DEBUG
    ? undefined
    : () => {
        console.log(chalk.bold.greenBright('Starting Main Process...'));
        process.env.TS_NODE_PROJECT = path.join(
          webpackPaths.rootPath,
          'tsconfig.json'
        );

        spawn('npm', ['run', 'dev:preload'], {
          shell: true,
          env: process.env,
          stdio: 'inherit',
        });
      },
};

const webpackConfiguration: webpack.Configuration = {
  devtool: false,

  mode: 'development',

  target: ['web', 'electron-renderer'],

  entry: {
    ...webpackPaths.windowsEntries,
  },

  output: {
    path: webpackPaths.distRendererPath,
    publicPath: '/',
    filename: '[name]/[name].dev.js',
    sourceMapFilename: '[name]/[name].js.map',
    library: {
      type: 'umd',
    },
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: /\.css$/,
      },
      {
        test: /\.scss$/,
        use: 'scss-loader',
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
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 1 * 1024 * 1024,
            esModule: false,
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    requiredByDLLConfig
      ? null
      : new webpack.DllReferencePlugin({
          context: webpackPaths.dllPath,
          manifest: require(manifest),
          sourceType: 'var',
        }),

    new ReactFastRefreshPlugin(),

    ...webpackPaths.windowsHtmlPlugins,

    UnoCSS({
      configFile: path.resolve(webpackPaths.rootPath, 'unocss.config.ts'),
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
  ],

  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: devServerConfiguration,
};

export default merge(baseConfig, webpackConfiguration);
