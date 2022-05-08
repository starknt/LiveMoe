import path from 'path'
import { defineConfig } from 'vite'
import webpackPaths from './.erb/configs/webpack.paths'

export default defineConfig({
  resolve: {
    alias: {
      'electron-main': webpackPaths.srcMainPath,
      'electron-web': webpackPaths.srcRendererPath,
      'common': path.join(webpackPaths.srcPath, 'common'),
    },
  },
})
