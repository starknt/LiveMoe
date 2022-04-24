import type { PaletteMode } from '@mui/material'
import {
  Box,
  Button,
  ThemeProvider,
  createTheme,
} from '@mui/material'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useCallback, useEffect, useState } from 'react'
import {
  initalizePlayerState,
  selectPlayerConfiguration,
  updateConfigurationAll,
} from 'electron-web/features/playerSlice'
import { useAppDispatch } from 'electron-web/store/store'
import { useSelector } from 'react-redux'
import useOnceEffect from 'electron-web/hooks/useOnceEffect'
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState'
import NormalPlayer from './NormalPlayer'

export default function Player() {
  const [themeValue, setThemeValue] = useLocalStorageState<PaletteMode>(
    'theme',
    'light',
    true,
  )
  const [windowMode, setWindowMode] = useState('normal')
  const theme = createTheme({
    palette: {
      mode: themeValue ?? 'light',
    },
  })

  const dispath = useAppDispatch()
  const configuration = useSelector(selectPlayerConfiguration).configuration

  useOnceEffect(() => {
    console.log('Player init')
    dispath(initalizePlayerState())
  })

  useEffect(() => {
    if (!window.livemoe)
      return
    livemoe.wallpaperPlayerService
      .onConfigChange()
      .then(onConfigurationChange =>
        onConfigurationChange((config) => {
          dispath(updateConfigurationAll(config))
        }),
      )
      .catch(err => console.error(err))
  }, [])

  const handleCloseWindow = useCallback(() => {
    window.livemoe.windowsService.toggleWindow('player')
  }, [])

  const handleThemeModeChange = useCallback(() => {
    if (themeValue === 'light')
      setThemeValue('dark')
    else
      setThemeValue('light')
  }, [themeValue])

  const mainIconColor = theme.palette.mode === 'dark' ? '#fff' : '#000'
  const lightIconColor
    = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

  return (
    <ThemeProvider theme={theme}>
      {windowMode === 'normal'
        ? (
        <NormalPlayer configuration={configuration} />
          )
        : (
            ''
          )}
      {/* Actions */}
      <Box sx={{ position: 'absolute', top: '3px', right: '28px' }}>
        <Button
          onClick={handleThemeModeChange}
          className="non-draggable"
          disableFocusRipple
          disableRipple
          disableElevation
          sx={{
            'minWidth': '24px',
            'padding': 0,
            'color': lightIconColor,
            ':hover': {
              color: mainIconColor,
              backgroundColor: 'transparent',
            },
            'zIndex': 9999,
          }}
        >
          {themeValue === 'light'
            ? (
            <DarkModeOutlinedIcon viewBox="0 0 28 28" />
              )
            : (
            <LightModeOutlinedIcon viewBox="0 0 28 28" />
              )}
        </Button>
      </Box>
      <Box sx={{ position: 'absolute', top: '2px', right: '4px' }}>
        <Button
          onClick={handleCloseWindow}
          className="non-draggable"
          disableFocusRipple
          disableRipple
          sx={{
            'minWidth': '24px',
            'padding': 0,
            'color': lightIconColor,
            ':hover': {
              color: mainIconColor,
              backgroundColor: 'transparent',
            },
            'zIndex': 9999,
          }}
        >
          <CloseOutlinedIcon />
        </Button>
      </Box>
    </ThemeProvider>
  )
}
