import { CursorConfiguration } from "./cursor";

export interface ICursor {
  enabled: boolean;
  style: CursorConfiguration | null;
}

export interface IApplicationCloseAction {
  dialog: boolean;
  action: 'hide' | 'exit';
}

export interface IVersions {
  app: string;
  v8: string;
  chrome: string;
  node: string;
  electron: string;
}

export interface IApplicationConfiguration {
  selfStartup: boolean;
  autoUpdate: boolean;
  resourcePath: string;
  coldStartup: boolean;
  closeAction: IApplicationCloseAction;
  updateTips: boolean;
  mode: 'game' | 'busy' | 'normal';
  application: {
    name: string;
    description: string;
    version: IVersions;
  };
}
