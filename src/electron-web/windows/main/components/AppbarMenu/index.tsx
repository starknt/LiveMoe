import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded'
import InfoRoundedIcon from '@mui/icons-material/InfoRounded'
import UpdateIcon from '@mui/icons-material/Update'
import { useCallback, useEffect, useState } from 'react'
import useToggle from 'electron-web/hooks/useToggle'
import { Badge } from '@mui/material'
import useAsyncState from 'electron-web/hooks/useAsyncState'
import About from '../About'
import './appbarMenu.css'
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect'

interface Props {
}

const AppbarMenu: React.FC<Props> = () => {
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null)
  const [about, toggleAbout] = useToggle(false)
  const [updateAvailable, setUpdateAvailable] = useAsyncState(async() => await livemoe.updateService.checkForUpdate(), false)

  useAsyncEffect(async() => {
    const onUpdateAvailable = await livemoe.updateService.onUpdateAvailable()
    const onUpdateNotAvailable = await livemoe.updateService.onUpdateNotAvailable()

    onUpdateAvailable((info) => {
      console.log('onUpdateAvailable', info)
      setUpdateAvailable(true)
    })

    onUpdateNotAvailable((info) => {
      console.log('onUpdateNotAvailable', info)
      setUpdateAvailable(false)
    })
  }, [])

  const handleOpenAppMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElMenu(event.currentTarget)
    },
    [],
  )

  const handleCloseAppMenu = useCallback(() => {
    setAnchorElMenu(null)
  }, [])

  const handleToggleSetting = useCallback(() => {
    window.livemoe.windowsService.toggleWindow('setting')
    handleCloseAppMenu()
  }, [])

  const handleCheckUpdate = useCallback(() => {
    handleCloseAppMenu()
    console.log(livemoe.updateService.checkForUpdate())
  }, [])

  const handleToggleAbout = useCallback(() => {
    handleCloseAppMenu()
    toggleAbout()
  }, [])

  return <>
        <Badge color={ updateAvailable ? 'secondary' : undefined } variant="dot" overlap="circular">
          <IconButton
            className="non-draggable"
            size="large"
            onClick={handleOpenAppMenu}
            sx={{ p: 1 }}
          >
              <MenuRoundedIcon />
            </IconButton>
        </Badge>
        <Menu
              className="appbar-menu"
              sx={{ mt: '45px' }}
              anchorEl={anchorElMenu}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'center',
                horizontal: 'center',
              }}
              open={Boolean(anchorElMenu)}
              onClose={handleCloseAppMenu}
            >
              <MenuItem onClick={handleToggleSetting}>
                <ListItemIcon>
                  <SettingsApplicationsRoundedIcon />
                </ListItemIcon>
                <ListItemText>
                  <Typography textAlign="center">设置</Typography>
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={handleCheckUpdate}>
                  <Badge overlap="rectangular" color={ updateAvailable ? 'secondary' : undefined } variant="dot">
                    <ListItemIcon>
                      <UpdateIcon />
                    </ListItemIcon>
                  </Badge>
                  <ListItemText>
                    <Typography textAlign="center">检查更新</Typography>
                  </ListItemText>
              </MenuItem>

              <MenuItem onClick={handleToggleAbout}>
                <ListItemIcon>
                  <InfoRoundedIcon />
                </ListItemIcon>
                <ListItemText>
                  <Typography textAlign="center">关于</Typography>
                </ListItemText>
              </MenuItem>
        </Menu>
      <About open={about} onClose={() => toggleAbout()} />
  </>
}

export default AppbarMenu
