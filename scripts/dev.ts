// TODO: 后续优化 主进程 自动重启
import Chokidar from 'chokidar';
import { ChildProcess, spawn } from 'child_process';

const enum HMRStatus {
  Idle,
  RUNING,
}

const enum FILE_STATUS {
  Idle,
  CHANGED,
  ERROR,
  SUCCESS,
}

let state: HMRStatus = HMRStatus.Idle;
let fileStatus: FILE_STATUS = FILE_STATUS.Idle;
let electronInstance: ChildProcess | null = null;
let timer: NodeJS.Timer | null = null;

function startElectron() {
  fileStatus = FILE_STATUS.Idle;

  electronInstance = spawn('npm', ['run', 'sm'], {
    shell: true,
    env: process.env,
    stdio: 'inherit',
    killSignal: 'SIGTERM',
  });

  electronInstance.on('exit', () => {
    if (fileStatus === FILE_STATUS.Idle) {
      electronInstance?.kill();
      process.exit(0);
    }

    state = HMRStatus.Idle;
  });

  electronInstance.on('error', () => {
    state = HMRStatus.Idle;
    electronInstance?.kill();
  });

  state = HMRStatus.RUNING;
}

function stopElectron() {
  electronInstance?.kill();
}

const watcher = Chokidar.watch('./src/electron-main', {
  cwd: process.cwd(),
  disableGlobbing: true,
  ignored: [
    /(^|[/\\])\../, // Dotfiles
    'node_modules',
    '**/*.map',
  ],
});

watcher.on('change', () => {
  fileStatus = FILE_STATUS.CHANGED;

  if (state === HMRStatus.RUNING) {
    stopElectron();
  }

  if (!timer) {
    timer = setInterval(() => {
      if (state === HMRStatus.Idle && electronInstance?.killed) {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        startElectron();
      }
    }, 500);
  }
});

startElectron();
