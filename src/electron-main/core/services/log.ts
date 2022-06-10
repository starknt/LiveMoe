import { Injectable, createDecorator } from '@livemoe/core'
import type { Event, IDisposable } from '@livemoe/utils'
import { Disposable, Emitter } from '@livemoe/utils'
import { toErrorMessage } from 'common/electron-common/error'
import { IEnviromentService } from './environmentService'

export const enum LogLevel {
  Trace,
  Debug,
  Info,
  Warning,
  Error,
}

export function now() {
  return new Date().toLocaleString()
}

export function format(args: any): string {
  let result = ''

  for (let i = 0; i < args.length; i++) {
    let a = args[i]

    if (typeof a === 'object') {
      try {
        a = JSON.stringify(a)
      }
      catch (e) { }
    }

    result += (i > 0 ? ' ' : '') + a
  }

  return result
}

export const DEFAULT_LOGLEVEL = LogLevel.Info

export interface ILogger extends IDisposable {
  onDidChangeLogLevel: Event<LogLevel>

  setLevel(level: LogLevel): void

  getLevel(): LogLevel

  trace(message: string, ...args: any[]): void

  debug(message: string, ...args: any[]): void

  info(message: string, ...args: any[]): void

  warn(message: string, ...args: any[]): void

  error(message: string | Error, ...args: any[]): void
}

export function log(logger: ILogger, level: LogLevel, message: string) {
  switch (level) {
    case LogLevel.Trace:
      return logger.trace(message)
    case LogLevel.Debug:
      return logger.debug(message)
    case LogLevel.Info:
      return logger.info(message)
    case LogLevel.Warning:
      return logger.warn(message)
    case LogLevel.Error:
      return logger.error(message)
    default:
      throw new Error(`Unknown log level: ${level}`)
  }
}

export interface ILoggerService {
  create(lable: string): ILogger
}

export const ILoggerService = createDecorator<ILoggerService>('ILoggerService')

export function LogLevelToString(logLevel: LogLevel): string {
  switch (logLevel) {
    case LogLevel.Trace: return 'trace'
    case LogLevel.Debug: return 'debug'
    case LogLevel.Info: return 'info'
    case LogLevel.Warning: return 'warn'
    case LogLevel.Error: return 'error'
  }
}

export function parseLogLevel(level: string) {
  switch (level) {
    case 'info':
      return LogLevel.Info
    case 'warn':
      return LogLevel.Warning
    case 'error':
      return LogLevel.Error
    case 'debug':
      return LogLevel.Debug
    case 'trace':
      return LogLevel.Trace
    default:
      return undefined
  }
}

export abstract class AbstractLogger extends Disposable {
  protected readonly _onDidChangeLogLevel = this._register(new Emitter<LogLevel>())

  private lable = ''

  private _level: LogLevel = DEFAULT_LOGLEVEL

  constructor(level: LogLevel = DEFAULT_LOGLEVEL) {
    super()

    this._level = level
  }

  setLable(lable: string) {
    this.lable = lable
  }

  getLable() {
    return this.lable
  }

  getLevel(): LogLevel {
    return this._level
  }

  checkLogLevel(level: LogLevel) {
    return this._level <= level
  }

  get onDidChangeLogLevel(): Event<LogLevel> {
    return this._onDidChangeLogLevel.event
  }

  setLevel(level: LogLevel) {
    if (this._level !== level) {
      this._level = level
      this._onDidChangeLogLevel.fire(level)
    }
  }
}

export class AdapterLogger extends AbstractLogger implements ILogger {
  constructor(private readonly adapter: { log: (level: LogLevel, array: any[]) => void }, logLevel: LogLevel = DEFAULT_LOGLEVEL) {
    super()
    this.setLevel(logLevel)
  }

  trace(message: string, ...args: any[]): void {
    this.adapter.log(LogLevel.Trace, [this.extractError(message), ...args])
  }

  debug(message: string, ...args: any[]): void {
    this.adapter.log(LogLevel.Debug, [this.extractError(message), ...args])
  }

  info(message: string, ...args: any[]): void {
    this.adapter.log(LogLevel.Info, [this.extractError(message), ...args])
  }

  warn(message: string, ...args: any[]): void {
    this.adapter.log(LogLevel.Warning, [this.extractError(message), ...args])
  }

  error(message: string | Error, ...args: any[]): void {
    this.adapter.log(LogLevel.Error, [this.extractError(message), ...args])
  }

  extractError(msg: Error | string) {
    if (typeof msg === 'string')
      return msg

    return toErrorMessage(msg, this.getLevel() <= LogLevel.Trace)
  }
}

export class ConsoleMainLogger extends AbstractLogger implements ILogger {
  useColors = true

  log(level: LogLevel, message: string | Error, ...args: any[]) {
    switch (level) {
      case LogLevel.Trace:
        this.trace(message, ...args)
        break
      case LogLevel.Debug:
        this.debug(message, ...args)
        break
      case LogLevel.Info:
        this.info(message, ...args)
        break
      case LogLevel.Warning:
        this.warn(message, ...args)
        break
      case LogLevel.Error:
        this.error(message, ...args)
        break
      default:
        break
    }
  }

  trace(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Trace) {
      if (this.useColors)
        console.trace(`\x1B[33m[${this.getLable()} ${now()}][Trace]\x1B[0m`, message, ...args)
      else
        console.trace(`[${this.getLable()} ${now()}]`, message, ...args)
    }
  }

  debug(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Debug)
      console.debug(`\x1B[32m[${this.getLable()} ${now()}][DEBUG]\x1B[0m`, message, ...args)
    else
      console.debug(message, ...args)
  }

  info(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Info)
      console.info(`\x1B[36m[${this.getLable()} ${now()}][INFO]\x1B[0m`, message, ...args)
    else
      console.info(message, ...args)
  }

  warn(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Warning)
      console.warn(`\x1B[33m[${this.getLable()} ${now()}][WARNING]x1B[0m`, message, ...args)
    else
      console.warn(message, ...args)
  }

  error(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Error)
      console.error(`\x1B[31m[${this.getLable()} ${now()}][ERROR]\x1B[0m`, message, ...args)
    else
      console.error(message, ...args)
  }
}

export class ConsoleLogger extends AbstractLogger implements ILogger {
  useColors = true

  log(level: LogLevel, message: string | Error, ...args: any[]) {
    switch (level) {
      case LogLevel.Trace:
        this.trace(message, ...args)
        break
      case LogLevel.Debug:
        this.debug(message, ...args)
        break
      case LogLevel.Info:
        this.info(message, ...args)
        break
      case LogLevel.Warning:
        this.warn(message, ...args)
        break
      case LogLevel.Error:
        this.error(message, ...args)
        break
      default:
        break
    }
  }

  trace(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Trace)
      console.trace('%c %s %s', 'color: #888', `[${this.getLable()} ${now()}]`, message, ...args)
    else
      console.trace(`[${this.getLable()} ${now()}]`, message, ...args)
  }

  debug(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Debug)
      console.debug('%c %s %s', 'color: #eee', `[${this.getLable()} ${now()}]`, message, ...args)
    else
      console.debug(message, ...args)
  }

  info(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Info)
      console.info('%c %s %s', 'color: #33f', `[${this.getLable()} ${now()}]`, message, ...args)
    else
      console.info(message, ...args)
  }

  warn(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Warning)
      console.warn('%c %s %s', 'color: #993', `[${this.getLable()} ${now()}]`, message, ...args)
    else
      console.warn(message, ...args)
  }

  error(message: string | Error, ...args: any[]): void {
    if (this.getLevel() <= LogLevel.Error)
      console.error('%c %s %s', 'color: #f33', `[${this.getLable()} ${now()}]`, message, ...args)
    else
      console.error(message, ...args)
  }
}

@Injectable(ILoggerService)
export class LoggerService extends Disposable implements ILoggerService {
  constructor(@IEnviromentService private readonly enviromentService: IEnviromentService) {
    super()
  }

  create(lable: string): ILogger {
    if (this.enviromentService.isMain()) {
      const logger = this._register(new ConsoleMainLogger())

      logger.setLable(lable)
      return logger
    }
    else {
      const logger = this._register(new ConsoleLogger())

      logger.setLable(lable)
      return logger
    }
  }
}
