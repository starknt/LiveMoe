import ElectronLog from 'electron-log';
import path from 'path';
import { dev } from './environment';

function resolvePath() {
  if (dev()) {
    return path.resolve('D://安装测试', 'Logs', 'LiveMoe.log');
  } else {
    return path.resolve(process.resourcesPath, 'Logs', 'LiveMoe.log');
  }
}

const applicationLogger = ElectronLog.create('livemoe');

applicationLogger.transports.file.resolvePath = () => resolvePath();
applicationLogger.transports.file.level = dev() ? 'info' : 'error';

export default applicationLogger;
