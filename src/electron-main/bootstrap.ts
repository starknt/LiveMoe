import minimist from 'minimist';
import Application from './Application';
import { app } from 'electron';
import { IPCMainServer } from 'common/electron-main';

const server = new IPCMainServer();

function registerListener() {
  app.on('before-quit', () => {
    console.log('dispose server ...');

    server.dispose();
  });

  app.on('will-quit', () => {
    console.log('will-quit');
  });
}

async function bootstrap(args: minimist.ParsedArgs) {
  registerListener();

  const application = new Application(args, server);

  application.initalize();
}

export default bootstrap;
