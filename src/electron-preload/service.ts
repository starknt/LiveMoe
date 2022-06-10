import * as is from 'common/electron-common/environment'
import { contextBridge, ipcRenderer } from 'electron'
import { IPCRenderServer } from '@livemoe/ipc/renderer'
import createDatabaseService from './services/dbService'
import createWindowsService from './services/windowService'
import createWallpaperPlayerService from './services/wallpaperPlayerService'
import createApplicationService from './services/applicationService'
import createTrayService from './services/trayService'
import createServerService from './services/serverService'
import createGuiService from './services/guiService'
import createWallpaperService from './services/wallpaperService'
import createUpdateService from './services/updateService'
import { when } from './helper'

// TODO: 注入服务, 服务注入到全局预加载脚本时, 会导致IPC服务器出错
// 1. 数据库服务
// 2. 窗口服务
// 3. 壁纸服务、壁纸播放器服务
// 4. 应用壁纸服务
// 5. 文件服务
// 6. 任务栏服务
// 7. 窗口托盘服务
// 8. 更新服务
async function getAllMainServiceChannel(server: IPCRenderServer) {
  const dbService = server.getChannel('lm:db')
  const windowsService = server.getChannel('lm:windows')
  const wallpaperPlayerService = server.getChannel('lm:wallpaper:player')
  const applicationService = server.getChannel('lm:application')
  const trayService = server.getChannel('lm:tray')
  const guiService = server.getChannel('lm:gui')
  const wallpaperService = server.getChannel('lm:wallpaper')
  const updateService = server.getChannel('lm:update')

  return {
    dbService,
    windowsService,
    wallpaperPlayerService,
    applicationService,
    trayService,
    guiService,
    wallpaperService,
    updateService,
  }
}

if (process.isMainFrame) {
  console.log('主框架')

  ipcRenderer.once('window:ctx', async(_, ctx: string) => {
    if (typeof ctx !== 'string')
      console.error('注入服务失败, 没有提供服务上下文')

    injectMainService(ctx)
  })
}

async function injectMainService(ctx: string) {
  // 如果存在则不注入
  if (window.livemoe)
    return

  console.info(`正在注入服务, 当前服务上下文为: ${ctx}!!!`)

  const server = new IPCRenderServer(ctx)

  const {
    dbService,
    windowsService,
    wallpaperPlayerService,
    applicationService,
    trayService,
    guiService,
    wallpaperService,
    updateService,
  } = await getAllMainServiceChannel(server)

  const exposeDbService = createDatabaseService(dbService)
  const exposeWindowsService = createWindowsService(windowsService)
  const exposeWallpaperPlayerService = createWallpaperPlayerService(
    wallpaperPlayerService,
  )
  const exposeApplicationService = createApplicationService(applicationService)
  const exposeTrayService = createTrayService(trayService)

  const exposeGuiService = createGuiService(guiService)

  const exposeWallpaperService = createWallpaperService(wallpaperService)

  const exposeUpdateService = createUpdateService(updateService)

  const exposeServerService = createServerService(server)

  contextBridge.exposeInMainWorld('livemoe', {
    dbService: exposeDbService,
    windowsService: exposeWindowsService,
    wallpaperPlayerService: exposeWallpaperPlayerService,
    applicationService: exposeApplicationService,
    trayService: exposeTrayService,
    serverService: exposeServerService,
    wallpaperService: exposeWallpaperService,
    updateService: exposeUpdateService,
    platform: {
      windows: () => is.win(),
      macOS: () => is.macOS(),
      linux: () => is.linux(),
    },
    dev: () => is.dev(),
    production: () => is.production(),
    guiService: exposeGuiService,
  })
}

contextBridge.exposeInMainWorld('helper', {
  whenLiveMoeReady: async() => {
    return await when(() => !!window.livemoe)
  },
  when,
})
