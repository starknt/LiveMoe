export interface PlayRuntimeConfiguration {
  status: 'playing' | 'paused' | 'pendding';
  mode: IWallpaperPlayerMode;
  volume: number;
  mute: boolean;
  disabled: boolean;
  wallpaperConfiguration: IWallpaperConfiguration | null;
  progress: IWallpaperPlayProgress | null;
  viewMode: boolean;
  viewVisible: boolean;
  userSettings: IUserSettings;
}

export interface IUserSettings {
  background: 'pause' | 'play';
}

export interface IWallpaperPlayerConfiguration {
  userSettings: IUserSettings;
  disabled: boolean;
  mode: IWallpaperPlayerMode;
  viewMode: boolean; // 观赏模式, 双击壁纸时会进入观赏模式, 此时会隐藏桌面图标和任务栏
  mute: boolean;
  volume: number;
  // 持久化的播放壁纸配置, 包括 当前播放壁纸、播放进度, 当该配置为空时, 则表明持久化播放壁纸失败, 通常失败原因有:
  // 1. 播放壁纸不存在
  // 2. 在windows电脑上, 关机或者重启时, 播放壁纸消息没有被持久化
  wallpaper: {
    configuration: IWallpaperConfiguration | null;
  };
}

// 非持久化的配置
export const DEFAULT_PLAY_RUNTIME_CONFIGURATION: PlayRuntimeConfiguration = {
  status: 'pendding',
  mode: 'order',
  volume: 50,
  mute: false,
  disabled: false,
  progress: null,
  wallpaperConfiguration: null,
  viewMode: false,
  viewVisible: true,
  userSettings: {
    background: 'pause',
  },
};

export const DEFAULT_CONFIGURATION: IWallpaperPlayerConfiguration = {
  userSettings: {
    background: 'pause',
  },
  disabled: false,
  mute: false,
  mode: 'single',
  viewMode: false,
  volume: 40,
  wallpaper: {
    configuration: null,
  },
};

export type IWallpaperPlayerState = 'pending' | 'play' | 'pause';

export type IWallpaperPlayerTypes = 1 | 2 | 3; // video html html

export interface IWallpaperPlayProgress {
  currentTime: number;
  duration: number;
}

export interface IWallpaperConfiguration {
  id: string;
  name: string;
  author: string;
  playPath: string;
  resourcePath: string;
  preview: string;
  description: string;
  rawConfiguration: IWallpaperConfigurationFile;
}

export interface IWallpaperConfigurationFile {
  type: IWallpaperPlayerTypes; // html video
  used: 0 | 1;
  url: string;
  _id: string;
  tags: string[];
  createTime: number;
  uploadTime: number;
  accessibility: 'private' | 'public';
  version: number;

  preview: string; // 预览图地址
  author: string;
  name: string;
  description: string;
  src: string;
}

export interface IWallpaperPlayingConfiguration {
  nowTime: number;
  totalTime: number;
  ended: boolean;
}

export interface IWallpaperPlayerPlayingConfiguration {
  configuration: IWallpaperConfiguration;
  playing: IWallpaperPlayingConfiguration;
}

export type IWallpaperPlayerMode = 'single' | 'random' | 'order' | 'list-loop';


export interface IWallpaperPlayerPlayListChangeEvent {
  type: 'added' | 'deleted'
  configuration?: IWallpaperConfiguration
  id?: string
}
