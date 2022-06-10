import { Injectable, createDecorator } from '@livemoe/core'

export interface IEnviromentService {
  isRenderer(): boolean

  isMain(): boolean

  isWorker(): boolean

  win(): boolean

  osx(): boolean

  linux(): boolean

  winStore(): boolean

  macStore(): boolean

  macStore(): boolean

  dev(): boolean

  production(): boolean
}

export const IEnviromentService = createDecorator<IEnviromentService>('IEnviromentService')

@Injectable(IEnviromentService)
export class EnviromentService implements IEnviromentService {
  private isEnvSet = 'NODE_ENV' in process.env
  private getFromEnv = process.env.NODE_ENV !== 'production'
  private isDev = false

  constructor() {
    if (this.isMain())
      this.isDev = this.isEnvSet ? this.getFromEnv : !require('electron').app.isPackaged
    if (this.isRenderer())
      this.isDev = this.isEnvSet ? this.getFromEnv : false
  }

  isRenderer = () => process.type === 'renderer'
  isMain = () => process.type === 'browser'
  isWorker = () => process.type === 'worker'
  win = () => process.platform === 'win32'
  osx = () => process.platform === 'darwin'
  linux = () => process.platform === 'linux'
  winStore = () => process.windowsStore
  macStore = () => process.mas
  macOS = () => this.osx()
  dev = () => this.isDev
  production = () => !this.isDev
}
