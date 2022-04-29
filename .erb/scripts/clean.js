import rimraf from 'rimraf';
import webpackPaths from '../configs/webpack.paths';
import process from 'process';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
const commandMap = {
  dist: webpackPaths.distPath,
  release: webpackPaths.releasePath,
  dll: webpackPaths.dllPath,
  build: webpackPaths.buildPath,
  plugin: webpackPaths.pluginPath,
};

args.forEach((x) => {
  const pathToRemove = commandMap[x];
  if (pathToRemove !== undefined && pathToRemove !== commandMap.plugin) {
    rimraf.sync(pathToRemove);
  }

  if(pathToRemove === commandMap.plugin) {
    fs.readdirSync(pathToRemove, { withFileTypes: true }).forEach((plugin) => {
      if(plugin.isDirectory()) {
        rimraf.sync(path.join(pathToRemove, plugin.name, 'dist'));
      }
    })

    rimraf.sync(webpackPaths.pluginPathProduction);
  }
});
