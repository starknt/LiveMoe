import useAsyncEffect from 'electron-web/hooks/useAsyncEffect'
import useEventListener from 'electron-web/hooks/useEventListener'
import { useMemo, useRef, useState } from 'react'
import type { PaletteMode } from '@mui/material'
import {
  MenuList,
  Paper,
  ThemeProvider,
  createTheme,
  styled,
} from '@mui/material'
import useOnceEffect from 'electron-web/hooks/useOnceEffect'
import { useAppDispatch } from 'electron-web/store/store'
import {
  initalizePlayerState,
  selectPlayerConfiguration,
  updateConfigurationAll,
} from 'electron-web/features/playerSlice'
import { useSelector } from 'react-redux'
import { Emitter } from 'common/electron-common/base/event'
import BorderLinearProgress from 'electron-web/components/BorderLinearProgress'
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState'
import Status from './Status'
import TrayMenu from './TrayMenu'

const TrayPaper = styled(Paper)(({ theme }) => ({
  transition: 'all 0.1s ease-in-out',
  borderRadius: theme.palette.mode === 'light' ? '4px' : '6px',
}))

export default function Tray() {
  const [themeValue] = useLocalStorageState<PaletteMode>(
    'theme',
    'light',
    true,
  )
  const theme = createTheme({
    palette: {
      mode: themeValue ?? 'light',
    },
  })
  const dispath = useAppDispatch()
  const store = useSelector(selectPlayerConfiguration)
  const readToShowEmitter = useMemo(() => new Emitter<void>(), [])
  const [progress, setProgress] = useState<null | number>(null)
  const [trayPoint, setTrayPoint] = useState<Electron.Rectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [menuPoint, setMenuPoint] = useState<Electron.Rectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEventListener('click', (e) => {
    if (e.target === document.body)
      livemoe.trayService.hide()
  })

  useEventListener('mousemove', (e) => {
    /**
     * 通过当前托盘位置的中心点和现在托盘菜单的右下角的点的位置, 计算出当前可转发的结束点的位置
     * 从 菜单右下角 到 托盘右下角
     */
    const mPoint = {
      x: menuPoint.x + menuPoint.width,
      y: menuPoint.y + menuPoint.height,
    }

    const tPoint = {
      x: trayPoint.x + trayPoint.width,
      y: trayPoint.y + trayPoint.height,
    }

    const x = e.clientX
    const y = e.clientY

    if (x >= mPoint.x && y >= mPoint.y && x <= tPoint.x && y <= tPoint.y)
      livemoe.trayService.setIgnoreMouseEvents(true)
    else
      livemoe.trayService.setIgnoreMouseEvents(false)
  })

  useOnceEffect(() => {
    dispath(initalizePlayerState())
  })

  useAsyncEffect(async() => {
    if (!window.livemoe)
      return

    const service = livemoe.serverService.createServerService('lm:tray')

    const onConfigurationChange
      = await livemoe.wallpaperPlayerService.onConfigChange()

    onConfigurationChange((config) => {
      dispath(updateConfigurationAll(config))
    })

    service.addEventHandler('show', () => {
      return readToShowEmitter.event
    })
  }, [window.livemoe])

  useAsyncEffect(async() => {
    if (!window.livemoe)
      return

    const onShow = await window.livemoe.trayService.onShow()
    window.livemoe.wallpaperPlayerService
      .onProgress()
      .then(onProgress =>
        onProgress(({ currentTime, duration }) => {
          setProgress((currentTime / duration) * 100)
        }),
      )
      .catch(err => console.error(err))

    onShow((rect: Electron.Rectangle) => {
      const root = document.getElementById('root')!
      const width = menuRef.current!.getBoundingClientRect().width ?? 260
      const height = menuRef.current!.getBoundingClientRect().height ?? 125

      const _point = {
        x: rect.x - width + rect.width / 2 - 5,
        y: rect.y - height + rect.height / 2 - 5,
        width,
        height,
      }

      setMenuPoint({
        x: _point.x,
        y: _point.y,
        width: _point.width,
        height: _point.height,
      })

      setTrayPoint({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      })

      root.style.setProperty('--x', `${_point.x}px`)
      root.style.setProperty('--y', `${_point.y}px`)

      readToShowEmitter.fire()
    })
  }, [window.livemoe])

  return (
    <ThemeProvider theme={theme}>
      <TrayPaper ref={menuRef}>
        <MenuList>
          <BorderLinearProgress variant="determinate" value={progress ?? 0} />
          <Status />
          <TrayMenu configuration={store.configuration} />
        </MenuList>
      </TrayPaper>
    </ThemeProvider>
  )
}
