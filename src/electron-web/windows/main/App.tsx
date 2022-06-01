import { initalizeApplicationState, updateConfigurationAll as updateApplicationConfigurationAll } from 'electron-web/features/applicationSlice'
import { addWallpaper, deleteWallpaperById, initalizePlayerState, updateAllWallpaper, updateConfigurationAll as updatePlayerConfigurationAll } from 'electron-web/features/playerSlice'
import { useAppDispatch } from 'electron-web/store/store'
import { useRoutes } from 'react-router'
import useOnceEffect from 'electron-web/hooks/useOnceEffect'
import type { PaletteMode } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material'
import { useMemo } from 'react'
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState'
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect'
import Routers from './router'
import './App.css'

export default function App() {
  const [themeValue] = useLocalStorageState<PaletteMode>(
    'theme',
    'light',
    true,
  )
  const dispatch = useAppDispatch()

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeValue ?? 'light',
        },
      }),
    [themeValue],
  )

  const rendererRouter = useRoutes(Routers)

  useOnceEffect(() => {
    dispatch(initalizePlayerState())
    dispatch(initalizeApplicationState())
  })

  useAsyncEffect(async() => {
    if (!window.livemoe)
      return

    const onPlayerStateChange = await window.livemoe.wallpaperPlayerService.onConfigChange()

    const onPlaylistChange = await window.livemoe.wallpaperPlayerService.onPlaylistChange()

    const onApplicationChange = await window.livemoe.applicationService.onConfigChange()

    onPlayerStateChange((config) => {
      dispatch(updatePlayerConfigurationAll(config))
    })

    onPlaylistChange((event) => {
      switch (event.type) {
        case 'added':
          if (event.configuration)
            dispatch(addWallpaper(event.configuration!))
          break
        case 'deleted':
          if (event.id)
            dispatch(deleteWallpaperById(event.id!))
          break
        case 'all':
          dispatch(updateAllWallpaper(event.configuration))
          break
      }
    })

    onApplicationChange((config) => {
      dispatch(updateApplicationConfigurationAll(config))
    })
  }, [window.livemoe])

  return <ThemeProvider theme={theme}>{rendererRouter}</ThemeProvider>
}
