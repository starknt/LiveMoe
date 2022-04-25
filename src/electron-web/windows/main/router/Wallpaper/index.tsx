import React, { useCallback, useState } from 'react'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { useSelector } from 'react-redux'
import { selectPlayList, selectPlayerConfiguration } from 'electron-web/features/playerSlice'
import { Backdrop, CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar } from '@mui/material'
import TinyText from 'electron-web/components/TinyText'
import WallpaperContainer from './components/wallpaperContainer'
import './index.css'

const Wallpaper: React.FC = () => {
  const player = useSelector(selectPlayerConfiguration)
  const playList = useSelector(selectPlayList)
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
  } | null>(null)

  const onContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
          }
        : null,
    )
  }, [contextMenu])

  const handleClose = useCallback(() => {
    setContextMenu(null)
  }, [])

  const renderContextMenu = useCallback(() => {
    return <>
        <MenuItem onClick={handleClose}>
          <ListItemIcon><PlayArrowRoundedIcon /> </ListItemIcon>
          <ListItemText>播放/暂停</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon><DeleteOutlineRoundedIcon /> </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
    </>
  }, [])

  if (!playList || playList.length === 0) {
    return (
      <Backdrop
        open={playList?.length === 0}
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    )
  }

  const playerConfiguration = player.configuration

  return (
    <div className="lm-wallpaper">
      <WallpaperContainer
        configurations={playList}
        playerConfiguration={player.configuration}
        onContextMenu={onContextMenu}
      />
      <Menu
        sx={{ minWidth: 40 }}
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        variant="menu"
      >
        <div>
          {renderContextMenu()}
        </div>
      </Menu>

      <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={playerConfiguration.status === 'playing'}
          message={<>正在{`${playerConfiguration.status === 'playing' ? '播放' : '暂停'}`}: <TinyText variant="span"> {`${playerConfiguration.wallpaperConfiguration?.name} - ${playerConfiguration.wallpaperConfiguration?.author ? playerConfiguration.wallpaperConfiguration?.author : '未知作者'}`}</TinyText> </> }
        />
    </div>
  )
}

export default Wallpaper
