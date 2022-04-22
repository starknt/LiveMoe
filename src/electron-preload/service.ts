import * as is from 'common/electron-common/environment';
import { contextBridge, ipcRenderer } from 'electron';
import { IPCRendererServer } from 'common/electron-renderer';
import createDatabaseService from './services/dbService';
import createWindowsService from './services/windowService';
import createWallpaperPlayerService from './services/wallpaperPlayerService';
import createApplicationService from './services/applicationService';
import createTrayService from './services/trayService';
import createTaskbarService from './services/taskbarService';
import createServerService from './services/serverService';
import { retry } from 'common/electron-common/utils';
import { when } from './helper';
import createGuiService from './services/guiService';

// TODO: 注入服务, 服务注入到全局预加载脚本时, 会导致IPC服务器出错
// 1. 数据库服务
// 2. 窗口服务
// 3. 壁纸服务、壁纸播放器服务
// 4. 应用壁纸服务
// 5. 文件服务
// 6. 任务栏服务
// 7. 窗口托盘服务
async function getAllMainServiceChannel(server: IPCRendererServer) {
  const dbService = await retry(async () => server.getChannel('lm:db'));
  const windowsService = await retry(async () =>
    server.getChannel('lm:windows')
  );
  const wallpaperPlayerService = await retry(async () =>
    server.getChannel('lm:wallpaper:player')
  );
  const applicationService = await retry(async () =>
    server.getChannel('lm:application')
  );
  const trayService = await retry(async () => server.getChannel('lm:tray'));
  const taskbarService = await retry(async () =>
    server.getChannel('lm:taskbar')
  );
  const guiService = await retry(async () => server.getChannel('lm:gui'));

  return {
    dbService,
    windowsService,
    wallpaperPlayerService,
    applicationService,
    trayService,
    taskbarService,
    guiService,
  };
}

ipcRenderer.once('window:ctx', async (_, ctx: string) => {
  if (typeof ctx !== 'string') {
    console.error('注入服务失败, 没有提供服务上下文');

    return;
  }

  console.info(`正在注入服务, 当前服务上下文为: ${ctx}!!!`);

  const server = new IPCRendererServer(ctx, ipcRenderer);

  const {
    dbService,
    windowsService,
    wallpaperPlayerService,
    applicationService,
    taskbarService,
    trayService,
    guiService,
  } = await getAllMainServiceChannel(server);

  const exposeDbService = createDatabaseService(dbService);
  const exposeWindowsService = createWindowsService(windowsService);
  const exposeWallpaperPlayerService = createWallpaperPlayerService(
    wallpaperPlayerService
  );
  const exposeApplicationService = createApplicationService(applicationService);
  const exposeTaskbarService = createTaskbarService(taskbarService);
  const exposeTrayService = createTrayService(trayService);

  const exposeGuiService = createGuiService(guiService);

  const exposeServerService = createServerService(server);

  contextBridge.exposeInMainWorld('livemoe', {
    dbService: exposeDbService,
    windowsService: exposeWindowsService,
    wallpaperPlayerService: exposeWallpaperPlayerService,
    applicationService: exposeApplicationService,
    taskbarService: exposeTaskbarService,
    trayService: exposeTrayService,
    serverService: exposeServerService,
    platform: {
      windows: () => is.win(),
      macOS: () => is.macOS(),
      linux: () => is.linux(),
    },
    dev: () => is.dev(),
    production: () => is.production(),
    guiService: exposeGuiService,
  });
});

contextBridge.exposeInMainWorld('helper', {
  whenLiveMoeReady: async () => {
    return await when(() => !!window.livemoe);
  },
  when,
});
