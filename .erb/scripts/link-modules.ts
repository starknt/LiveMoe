import fs from 'fs';
import webpackPaths from '../configs/webpack.paths';

const srcNodeModulesPath = webpackPaths.srcNodeModulesPath;
const appNodeModulesPath = webpackPaths.appNodeModulesPath;
const appPackagePath = webpackPaths.appPackagePath;
const srcPackagePath = webpackPaths.srcPackagePath;

if (!fs.existsSync(srcNodeModulesPath) && fs.existsSync(appNodeModulesPath)) {
  fs.symlinkSync(appNodeModulesPath, srcNodeModulesPath, 'junction');
}

if (!fs.existsSync(srcPackagePath) && fs.existsSync(appPackagePath)) {
  fs.symlinkSync(appPackagePath, srcPackagePath, 'file');
}
