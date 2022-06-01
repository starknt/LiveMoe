import type minimist from 'minimist'
import { app } from 'electron'
import { Server as IPCMainServer } from '@livemoe/ipc/main'
import Application from './Application'

const server = new IPCMainServer()

function registerListener() {
  app.on('before-quit', () => {
    console.log('dispose server ...')

    server.dispose()
  })

  app.on('will-quit', () => {
    console.log('will-quit')
  })
}

async function bootstrap(args: minimist.ParsedArgs) {
  registerListener()

  const application = new Application(args, server)

  application.initalize()
}

export default bootstrap
