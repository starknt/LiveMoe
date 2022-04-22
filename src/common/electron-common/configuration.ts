import EventEmitter from 'events';
import { IApplicationConfiguration } from './application';
import {
  IWallpaperPlayerConfiguration,
  IWallpaperPlayerRuntimeConfiguration,
} from './wallpaperPlayer';
import { Event } from './base/event';

export type IConfigurationKeyChangeEvent<T> = (nValue: T, oValue: T) => void;

export type Unsubscribe = () => EventEmitter;

export interface IEnvironmentConfiguration {
  readonly onConfigurationChange: Event<IConfigurationChangeEvent>;

  readonly onPlayerConfigurationChange: Event<IPlayerConfigurationChangeEvent>;

  readonly onApplicationConfigurationChange: Event<IApplicationConfigurationChangeEvent>;

  readonly onPlayerRuntimeConfigurationChange: Event<IPlayerRuntimeConfigurationChangeEvent>;

  setPlayerConfiguration(
    configuration: Partial<IWallpaperPlayerConfiguration>
  ): void;
  setPlayerConfiguration<T extends IWallpaperPlayerConfiguration>(
    configuration: keyof T,
    value: unknown
  ): void;
  setApplicationConfiguration(
    configuration: keyof IApplicationConfiguration,
    value: unknown
  ): void;
  setApplicationConfiguration(
    configuration: Partial<IApplicationConfiguration>
  ): void;
  setPlayerRuntimeConfiguration(
    configuration: Partial<IWallpaperPlayerRuntimeConfiguration>
  ): void;
  setPlayerRuntimeConfiguration(
    configuration: keyof IWallpaperPlayerRuntimeConfiguration,
    value: unknown
  ): void;

  getPlayerConfiguration(key: keyof IWallpaperPlayerConfiguration): unknown;
  getPlayerConfiguration(): IWallpaperPlayerConfiguration;
  getApplicationConfiguration<T>(key: keyof IApplicationConfiguration): T;
  getApplicationConfiguration(): IApplicationConfiguration;
  getPlayerRuntimeConfiguration<T>(
    key: keyof IWallpaperPlayerRuntimeConfiguration
  ): T;
  getPlayerRuntimeConfiguration(): IWallpaperPlayerRuntimeConfiguration;

  resetApplicationConfiguration(): void;
  resetApplicationConfiguration(
    keys: (keyof IApplicationConfiguration)[]
  ): void;

  resetPlayerConfiguration(): void;
  resetPlayerConfiguration(keys: (keyof IWallpaperPlayerConfiguration)[]): void;
  resetPlayerRuntimeConfiguration(): void;
  resetPlayerRuntimeConfiguration(
    keys: (keyof IWallpaperPlayerRuntimeConfiguration)[]
  ): void;

  onPlayerRuntimeConfigurationDidChange<T extends any>(
    key: keyof IWallpaperPlayerRuntimeConfiguration,
    cb: IConfigurationKeyChangeEvent<T>,
    thisArg?: unknown
  ): Unsubscribe;

  onApplicationConfigurationDidChange<T extends any>(
    key: keyof IApplicationConfiguration,
    cb: IConfigurationKeyChangeEvent<T>,
    thisArg?: unknown
  ): Unsubscribe;

  onPlayerConfigurationDidChange<T extends any>(
    key: keyof IWallpaperPlayerConfiguration,
    cb: IConfigurationKeyChangeEvent<T>,
    thisArg?: unknown
  ): Unsubscribe;
}

export interface IConfigurationChangeEvent {
  application: IApplicationConfiguration;
  player: IWallpaperPlayerConfiguration;
}

export interface IPlayerConfigurationChangeEvent {
  configuration: IWallpaperPlayerConfiguration;
}

export interface IApplicationConfigurationChangeEvent {
  configuration: IApplicationConfiguration;
}

export interface IConfiguration {
  application: IApplicationConfiguration;
  player: IWallpaperPlayerConfiguration;
}

export interface IPlayerRuntimeConfigurationChangeEvent {
  configuration: IWallpaperPlayerRuntimeConfiguration;
}

export interface IPlayerConfiguration {
  configuration: IWallpaperPlayerConfiguration;
}

export interface IPlayerRuntimeConfiguration {
  configuration: IWallpaperPlayerRuntimeConfiguration;
}
