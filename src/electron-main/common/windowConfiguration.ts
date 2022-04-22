import { dev } from 'common/electron-common/environment';
import {
  BrowserViewConstructorOptions,
  BrowserWindowConstructorOptions,
} from 'electron';
import { resolvePreloadPath } from 'electron-main/utils';

export type IWallpaperPlayerViewConfiguration = BrowserViewConstructorOptions;
export type IWallpaperPlayerWindowConfiguration =
  BrowserWindowConstructorOptions;

const WindowConfiguration: BrowserWindowConstructorOptions = {
  show: false,
  hasShadow: true,
  autoHideMenuBar: true,
  frame: false,
  transparent: true,
  backgroundColor: '#FF3e3e3e',
  webPreferences: {
    webSecurity: !dev(),
    nodeIntegration: false,
    contextIsolation: true,
    preload: resolvePreloadPath('service'),
  },
};

export function mergeWindowConfiguration(
  ...options: BrowserWindowConstructorOptions[]
): BrowserWindowConstructorOptions;
export function mergeWindowConfiguration(
  ...options: BrowserWindowConstructorOptions[]
): BrowserWindowConstructorOptions {
  return Object.assign(WindowConfiguration, ...options);
}

const WallpaperPlayerViewConfiguration: IWallpaperPlayerViewConfiguration = {
  webPreferences: {
    safeDialogs: true,
    nativeWindowOpen: false,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    backgroundThrottling: false,
    webviewTag: false,
    contextIsolation: true,
    spellcheck: false,
    enableWebSQL: false,
    devTools: dev(),
    experimentalFeatures: true,
    preload: resolvePreloadPath('wallpaper'),
  },
};

const WallpaperPlayerWindowConfiguration: IWallpaperPlayerWindowConfiguration =
  {
    title: 'LiveMoe - WallpaperEngine',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    minHeight: 1080,
    minWidth: 1920,
    maxHeight: 1080,
    maxWidth: 1920,
    center: true,
    closable: false,
    show: false,
    skipTaskbar: true,
    movable: false,
    transparent: true,
    backgroundColor: '#003C3F41',
    autoHideMenuBar: true,
    hasShadow: false,
    frame: false,
    fullscreen: true,
    resizable: false,
    type: 'desktop',
  };

const MainWindowConfiguration: BrowserWindowConstructorOptions = {
  width: 1200,
  height: 720,
  minWidth: 720,
  minHeight: 360,
};

const SettingWindowConfiguration: BrowserWindowConstructorOptions = {
  width: 720,
  height: 360,
  resizable: false,
};

const DialogWindowConfiguration: BrowserWindowConstructorOptions = {};

export {
  WallpaperPlayerViewConfiguration,
  WallpaperPlayerWindowConfiguration,
  MainWindowConfiguration,
  SettingWindowConfiguration,
};
