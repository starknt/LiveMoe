export interface IWallpaperPlayerError {
  errorCode: number;
  errorDesc: string;
}

export interface IWallpaperPlayerEmitter {}

export interface IWallpaperPlayerPlayFailEvent {
  errorCode: number;
  errorDesc: string;
}

export interface IWallpaperPlayerVolumeChangeEvent {
  oVolume: number;
  nVolume: number;
}

export interface IWallpaperPlayerAudioChangeEvent {
  mute: boolean;
}

export interface IPlaylistOptions {}

export interface IWallpaperPlayerDisabledChangeEvent {
  disabled: boolean;
}

export interface IWallpaperPlayerLoopChangeEvent {
  loop: boolean;
}
