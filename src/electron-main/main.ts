import { app, protocol } from 'electron'
import minimist from 'minimist'
import { dev, production, win } from 'common/electron-common/environment'
import { Emitter, Event } from '@livemoe/utils'
import applicationLogger from 'common/electron-common/applicationLogger'
import bootstrap from './bootstrap'
import 'common/locales'

const skipArgv = dev() ? 4 : 2

const argv = minimist(process.argv.slice(skipArgv), { boolean: '--' })

const getSingleInstanceLock = new Emitter<void>()
const gotSingleInstanceLock = Event.toPromise(getSingleInstanceLock.event)
const onReady = Event.fromNodeEventEmitter<void>(app, 'ready')

async function exceptionHandler() {
  process.on('uncaughtException', err => applicationLogger.error(err))

  process.on('SIGTERM', () => {
    if (win()) {
      (dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools')).RestoreWorkerW()
      app.quit()
    }
  })

  process.on('SIGINT', () => {
    if (win()) {
      (dev() ? require('win-func-tools') : __non_webpack_require__('win-func-tools')).RestoreWorkerW()
      app.quit()
    }
  })
}

async function beforeReady() {
  // 注册 App 协议
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'file',
      privileges: {
        standard: true,
        secure: false,
        bypassCSP: false,
        corsEnabled: true,
        stream: true,
      },
    },
  ])

  if (production()) {
    // app.setPath('userData', resolve);
  }

  app.commandLine.appendSwitch('disable-site-isolation-trials')
  app.commandLine.appendSwitch('--ignore-certificate-errors', 'true')
}

async function ready() {
  try {
    if (dev()) {
      (await import('electron-debug')).default()
      const {
        REACT_DEVELOPER_TOOLS,
        REDUX_DEVTOOLS,
        default: installer,
      } = await import('electron-devtools-installer')

      await installer([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
    }

    await exceptionHandler()

    await bootstrap(argv)
  }
  catch (err) {
    applicationLogger.error(err)
    app.exit(-1)
  }
}

async function exit(err: Error) {
  if (dev())
    console.error(err)

  if (production())
    applicationLogger.error(err)

  app.exit(-1)
}

gotSingleInstanceLock
  .then(beforeReady)
  .then(() => onReady(ready))
  .then(() => getSingleInstanceLock.dispose())
  .catch(exit)

if (!app.hasSingleInstanceLock()) {
  const singleInstanceLock = app.requestSingleInstanceLock()

  if (singleInstanceLock) {
    getSingleInstanceLock.fire()
  }
  else {
    getSingleInstanceLock.dispose()
    app.quit()
  }
}
