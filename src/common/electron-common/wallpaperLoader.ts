import { IWallpaperConfiguration, IWallpaperConfigurationFile } from './wallpaperPlayer';

export interface IWallpaperChangeEvent {
  type: 'deleted' | 'added' | 'all'
  path: string
  configuration: IWallpaperConfiguration | null | IWallpaperConfiguration[]
}

export interface IWallpaperResourceLoadEvent {
  resourcePath: string;
}

export interface IWallpaperResourceLoadEndedEvent {
  wallpapers: IWallpaperConfiguration[];
}

export interface IWallpaperResourceChangedEvent {}

export interface IWallpaperResourcePathChangedEvent {}

export interface IWallpaperConfigurationFileWithBasePath
  extends IWallpaperConfigurationFile {
  basePath: string;
}

export interface IWallpaperConfigurationFileSchema {
  ext: 'lmw' | 'upup' | 'json';
  name: 'theme' | 'LivelyInfo';
  transform: (
    basePath: string,
    rawConfiguration: Record<string | symbol | number, unknown>
  ) => IWallpaperConfigurationFile | null;
}

export interface IWallpaperResourcePathBeforeChangeEvent {
  oldResourcePath: string;
  newResourcePath: string;
}

export interface IWallpaperConfigurationUpUpFile {
  isOriginal: 0 | 1;
  reprintUrl: string;
  tag: string;
  themeType?: 1 | 2 | 3; // 1 ---> video, 2,3 ---> html 2可交互 3不可交互
  themeno: string;
  url: string;
  ver: string;

  preview: string; // 预览图地址
  author: string;
  name: string;
  description: string;
  src: string;
}

export interface IWallpaperConfigurationLivelyFile {
  AppVersion: string;
  Title: string;
  Thumbnail: string;
  Preview: string;
  Desc: string;
  Author: string;
  License: string;
  Contact: string;
  Type: number;
  FileName: string;
  Arguments: any;
  IsAbsolutePath: boolean;
}
