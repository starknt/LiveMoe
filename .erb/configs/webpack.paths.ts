import HtmlWebpackPlugin from 'html-webpack-plugin';
import fs from 'fs';
import path from 'path';

const rootPath = path.join(__dirname, '../..');
const dllPath = path.join(__dirname, '../dll');
const pluginPath = path.join(rootPath, 'plugins');

const srcPath = path.join(rootPath, 'src');
const srcMainPath = path.join(srcPath, 'electron-main');
const srcRendererPath = path.join(srcPath, 'electron-web');
const srcPagesPath = path.join(srcRendererPath, 'windows');
const srcPreloadPath = path.join(srcPath, 'electron-preload');

const releasePath = path.join(rootPath, 'release');
const appPath = path.join(releasePath, 'app');
const appPackagePath = path.join(appPath, 'package.json');
const appNodeModulesPath = path.join(appPath, 'node_modules');
const srcNodeModulesPath = path.join(srcPath, 'node_modules');
const srcPackagePath = path.join(srcPath, 'package.json');

const distPath = path.join(appPath, 'dist');
const distMainPath = path.join(distPath, 'main');
const distRendererPath = path.join(distPath, 'renderer');

const buildPath = path.join(releasePath, 'build');

let windowsEntries: any = {};
let windowsHtmlPlugins: any[] = [];

const windowsHtmlTitleMap: any = {
  main: 'LiveMoe - 商店',
  setting: 'LiveMoe - 设置',
  about: 'LiveMoe - 关于',
  update: 'LiveMoe - 更新',
  player: 'LiveMoe - 播放器',
};

fs.readdirSync(srcPagesPath, { withFileTypes: true })
  .filter(
    (page) =>
      page.isDirectory() &&
      fs.existsSync(path.join(srcPagesPath, page.name, 'index.tsx'))
  )
  .map((page) => {
    windowsEntries[`${page.name}`] = path.join(
      srcPagesPath,
      page.name,
      'index.tsx'
    );

    windowsHtmlPlugins.push(
      new HtmlWebpackPlugin({
        title: windowsHtmlTitleMap[page.name] ?? 'LiveMoe - ???',
        filename: path.join(page.name, 'index.html'),
        inject: true,
        templateContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>${
                windowsHtmlTitleMap[page.name] ?? 'LiveMoe - ???'
              }</title>
            </head>
            <body>
              <div id="root"></div>
            </body>
          </html>
        `,
        minify: {
          collapseWhitespace: true,
          removeAttributeQuotes: false,
          removeComments: true,
        },
        isBrowser: false,
        isDevelopment: process.env.NODE_ENV !== 'production',
        chunks: [page.name],
        nodeModules: appNodeModulesPath,
      })
    );
  });

export default {
  rootPath,
  dllPath,
  pluginPath,
  srcPath,
  srcMainPath,
  srcRendererPath,
  srcPagesPath,
  srcPreloadPath,
  releasePath,
  appPath,
  appPackagePath,
  appNodeModulesPath,
  srcNodeModulesPath,
  srcPackagePath,
  distPath,
  distMainPath,
  distRendererPath,
  buildPath,
  windowsEntries,
  windowsHtmlPlugins,
};
