import React, { useCallback, useState } from 'react'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseIcon from '@mui/icons-material/Pause'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { useSelector } from 'react-redux'
import { selectPlayList, selectPlayerConfiguration } from 'electron-web/features/playerSlice'
import { Backdrop, Box, CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar } from '@mui/material'
import TinyText from 'electron-web/components/TinyText'
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState'
import type { IWallpaperConfiguration } from 'common/electron-common/wallpaperPlayer'
import WallpaperContainer from './components/wallpaperContainer'
import './index.css'
import QuickCreator from './components/quickCreator'

const Wallpaper: React.FC = () => {
  const [filterType] = useLocalStorageState('filterType', 'all', true)
  const player = useSelector(selectPlayerConfiguration)
  const playList = useSelector(selectPlayList)
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
    configuration: IWallpaperConfiguration
    playing: boolean
  } | null>(null)

  const onContextMenu = useCallback((event: React.MouseEvent, configuration: IWallpaperConfiguration, playing: boolean) => {
    event.preventDefault()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            configuration,
            playing,
          }
        : null,
    )
  }, [contextMenu])

  const handleClose = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleToggle = useCallback(() => {
    if (!contextMenu)
      return

    const { playing, configuration } = contextMenu

    if (playing)
      livemoe.wallpaperPlayerService.toggle()
    else
      livemoe.wallpaperPlayerService.play(configuration)

    handleClose()
  }, [contextMenu])

  const handleDelete = useCallback(() => {
    if (!contextMenu)
      return

    handleClose()
  }, [contextMenu])

  const filterVideo = useCallback((item: IWallpaperConfiguration) => {
    return item.rawConfiguration.type === 1
  }, [])

  const filterHtml = useCallback((item: IWallpaperConfiguration) => {
    return item.rawConfiguration.type >= 2
  }, [])

  const renderContextMenu = useCallback(() => {
    if (contextMenu === null)
      return ''

    const { playing } = contextMenu

    return <>
        <MenuItem onClick={handleToggle}>
          <ListItemIcon>{ playing ? <PauseIcon /> : <PlayArrowRoundedIcon /> }</ListItemIcon>
          <ListItemText>{ playing ? '暂停' : '播放' }</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled={playing} onClick={handleDelete}>
          <ListItemIcon><DeleteOutlineRoundedIcon /> </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
    </>
  }, [contextMenu, handleToggle, handleDelete])

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
  const filterPlayList = playList.filter((item) => {
    if (filterType === 'html')
      return filterHtml(item)

    if (filterType === 'video')
      return filterVideo(item)

    return true
  })

  return (
    <Box className="lm-wallpaper" >
      <QuickCreator />
      <WallpaperContainer
        configurations={filterPlayList}
        playerConfiguration={player.configuration}
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
          autoHideDuration={6000}
          open={playerConfiguration.status !== 'pendding'}
          message={<>正在{`${playerConfiguration.status === 'playing' ? '播放' : '暂停'}`}: <TinyText variant="span"> {`${playerConfiguration.wallpaperConfiguration?.name} - ${playerConfiguration.wallpaperConfiguration?.author ? playerConfiguration.wallpaperConfiguration?.author : '未知作者'}`}</TinyText> </> }
        />
    </Box>
  )
}

export default Wallpaper
