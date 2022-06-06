// 实现一个兼容web环境的console color

const IsInRequire = typeof global !== 'undefined' && global.require;

const IsInElectron = typeof window !== 'undefined' && window.process && window.process.type;

const node = () => IsInRequire

const web = () => {
  if(IsInElectron) {
    return process.type === 'renderer'
  }

  return !node()
};


/**
 * web
 * console.log("%c %s  %c %s ", "color: #fff; padding: 1px 2px; border-radius: 3px 0px 0px 3px;background-color: #01ee3f;", "Version", "color: #fff; padding: 1px 2px; border-radius: 0px 3px 3px 0px;background-color: #d1ee3f;", "v1.0.0")
 * node
 * console.log("\x1b[32m%s\x1b[0m \x1b[33m%s\x1b[0m", 'Version', 'v1.0.0')
 */

export const enum NodeConsoleColor {
  Reset = '\x1b[0m',

  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Italic = '\x1b[3m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',

  Black = '\x1b[30m',
  Red = '\x1b[31m',
  Green = '\x1b[32m',
  Yellow = '\x1b[33m',
  Blue = '\x1b[34m',
  Magenta = '\x1b[35m',
  Cyan = '\x1b[36m',
  White = '\x1b[37m',

  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
}

export const enum WebConsoleColor {
  Reset = '',

}

class Color {}

export class ConsoleColor {
  private readonly color = new Color();

  red(message: string) {

  }
}
