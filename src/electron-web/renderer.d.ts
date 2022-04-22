import { LiveMoe } from 'livemoe';

declare global {
  // 注入 livemoe API
  var livemoe: {
    dbService: LiveMoe.DbService;
    windowsService: LiveMoe.WindowsService;
    wallpaperPlayerService: LiveMoe.WallpaperPlayerService;
    applicationService: LiveMoe.ApplicationService;
    taskbarService: LiveMoe.TaskbarService;
    trayService: LiveMoe.TrayService;
    serverService: LiveMoe.RendererService;
    platform: LiveMoe.Platform;
    guiService: LiveMoe.GuiService;
    dev: () => boolean;
    production: () => boolean;
  };

  var gui: LiveMoe.Gui;

  var helper: {
    whenLiveMoeReady(): Promise<void>;
  };
}
