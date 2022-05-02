import React, { useCallback, useState } from 'react'
import { AppBar, Box, Container, IconButton, Menu, MenuItem, Skeleton, Toolbar, Typography } from '@mui/material'
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useNavigate } from 'react-router-dom'
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { selectApplicationConfiguration } from 'electron-web/features/applicationSlice'
import type { INavgationItem } from '../Navgation'
import Navigation from '../Navgation'
import AppbarMenu from '../AppbarMenu'
import './index.css'

const settings = ['个人信息', '消息', '退出登录']

const NavItems: INavgationItem[] = [
  {
    name: '我的壁纸',
    to: '',
  },
  {
    name: '组件',
    to: 'plugin',
  },
]

export default React.forwardRef((_, ref) => {
  const configuration = useSelector(selectApplicationConfiguration)
  const [themeValue, setThemeValue] = useLocalStorageState('theme', 'light', true)
  const navgation = useNavigate()

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = useCallback(() => {
    setAnchorElUser(null)
  }, [])

  const handleBack = useCallback(() => {
    navgation(-1)
  }, [])

  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  const handleMinimize = useCallback(() => {
    window.livemoe.windowsService.sendWindowMessage('main', 'min')
  }, [])

  const handleClose = useCallback(() => {
    if (configuration.closeAction.action === 'hide')
      window.livemoe.windowsService.sendWindowMessage('main', 'hide')
    else
      window.livemoe.applicationService.quit()
  }, [configuration])

  const handleThemeModeChange = useCallback(() => {
    if (themeValue === 'light')
      setThemeValue('dark')
    else
      setThemeValue('light')
  }, [themeValue])

  const appBarClassName = classNames('app-bar', 'draggable', `app-bar-${themeValue}`)

  return (
    <AppBar
      ref={ref}
      position="fixed"
      color="secondary"
      className={appBarClassName}
      enableColorOnDark
    >
      <Container style={{ paddingRight: 0 }} sx={{ gap: 1 }} maxWidth="xl">
        <Toolbar style={{ paddingRight: 6 }}>
          <Box sx={{ flexGrow: 1 }}>
            <IconButton onClick={handleBack} className="non-draggable">
              <ArrowBackIosRoundedIcon />
            </IconButton>
            <IconButton onClick={handleRefresh} className="non-draggable">
              <RefreshRoundedIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              paddingRight: 0,
            }}
          >
            <Navigation items={NavItems} />
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              className="non-draggable"
              onClick={handleOpenUserMenu}
              sx={{ p: 0 }}
            >
              <Skeleton variant="circular" width={40} height={40} />
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map(setting => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box className="flex" sx={{ flexGrow: 0, mx: 1 }}>
            <AppbarMenu />
          </Box>
          <Box sx={{ flexGrow: 0, mx: 1 }}>
              <IconButton
                disableRipple
                disableFocusRipple
                className="non-draggable"
                sx={{
                  'p': 1,
                  ':hover': {
                    color: 'skyblue',
                  },
                }}
                onClick={handleThemeModeChange}
              >
                {
                  themeValue === 'dark' ? <LightModeIcon /> : <DarkModeIcon />
                }
              </IconButton>

            <IconButton
              onClick={handleMinimize}
              sx={{
                'p': 1,
                ':hover': {
                  color: 'skyblue',
                },
              }}
              disableRipple
              disableFocusRipple
              className="non-draggable"
              size="large"
            >
              <MinimizeRoundedIcon viewBox="0 7 24 24" />
            </IconButton>
            <IconButton
              onClick={handleClose}
              sx={{
                'p': 1,
                ':hover': {
                  color: 'skyblue',
                },
              }}
              disableRipple
              disableFocusRipple
              className="non-draggable"
              size="large"
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
})
