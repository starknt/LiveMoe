import React, { useCallback, useState } from 'react'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseIcon from '@mui/icons-material/Pause'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { useSelector } from 'react-redux'
import { selectPlayList, selectPlayerConfiguration } from 'electron-web/features/playerSlice'
import { Backdrop, Box, CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar } from '@mui/material'
import TinyText from 'electron-web/components/TinyText'
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState'
import type { IWallpaperConfiguration } from 'common/electron-common/wallpaperPlayer'
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect'
import AlertDialog from 'electron-web/components/AlertDialog'
import WallpaperContainer from './components/wallpaperContainer'
import QuickCreator from './components/quickCreator'
import './index.css'

const Wallpaper: React.FC = () => {
  const [deleteConfiguration, setDeleteConfiguration] = useState<IWallpaperConfiguration | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState<string | React.ReactNode>('')
  const [filterType] = useLocalStorageState('filterType', 'all', true)
  const [searchKeyword] = useLocalStorageState('searchKeyword', '', true)
  const player = useSelector(selectPlayerConfiguration)
  const playList = useSelector(selectPlayList)
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
    configuration: IWallpaperConfiguration
    playing: boolean
  } | null>(null)

  useAsyncEffect(async() => {
    if (!window.livemoe)
      return

    const onPlayChange = await window.livemoe.wallpaperPlayerService.onPlay()

    onPlayChange((configuration) => {
      const playerConfiguration = player.configuration

      setSnackbarMessage(<>正在{`${playerConfiguration.status === 'playing' ? '播放' : '暂停'}`}: <TinyText variant="span"> {`${configuration?.name} - ${configuration?.author ? configuration?.author : '未知作者'}`}</TinyText> </>)
      setTimeout(() => setSnackbar(true), 1000)
    })
  }, [window.livemoe, player])

  const onContextMenu = useCallback((event: React.MouseEvent, configuration: IWallpaperConfiguration, playing: boolean) => {
    event.preventDefault()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            configuration,
            playing: playing && player.configuration.status === 'playing',
          }
        : null,
    )
  }, [contextMenu, player])

  const handleClose = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleToggle = useCallback(() => {
    if (!contextMenu || !player.configuration.wallpaperConfiguration)
      return

    const { configuration } = contextMenu

    if ((configuration.id === player.configuration!.wallpaperConfiguration.id) || (configuration.playPath === player.configuration!.wallpaperConfiguration.playPath))
      livemoe.wallpaperPlayerService.toggle()
    else
      livemoe.wallpaperPlayerService.play(configuration)

    handleClose()
  }, [contextMenu])

  const handleDelete = useCallback(async() => {
    if (!contextMenu)
      return

    setDeleteDialogOpen(true)
    setDeleteConfiguration(contextMenu.configuration)

    handleClose()
  }, [contextMenu])

  const handleOpenFolder = useCallback(() => {
    if (contextMenu && contextMenu.configuration)
      window.livemoe.guiService.openFolder(contextMenu.configuration?.resourcePath || '')
  }, [contextMenu])

  const filterVideo = useCallback((item: IWallpaperConfiguration) => {
    return item.rawConfiguration.type === 1
  }, [])

  const filterHtml = useCallback((item: IWallpaperConfiguration) => {
    return item.rawConfiguration.type >= 2
  }, [])

  const handleDeleteAccept = useCallback(async() => {
    if (!deleteConfiguration)
      return

    setDeleteDialogOpen(false)

    const result = await livemoe.wallpaperService.deleteWallpaper(deleteConfiguration)

    if (result) {
      setSnackbarMessage('删除成功')
      setSnackbar(true)
    }
    else {
      setSnackbarMessage('删除失败, 移动壁纸到回收站的过程中发生错误!!!')
      setSnackbar(true)
    }
  }, [deleteConfiguration])

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false)
  }, [])

  const renderContextMenu = () => {
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
          <ListItemText>删除壁纸</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenFolder}>
          <ListItemIcon><FolderOpenIcon /></ListItemIcon>
          <ListItemText>从资源管理器中打开</ListItemText>
        </MenuItem>
    </>
  }

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

  const filterPlayList = playList.filter((item) => {
    if (filterType === 'html')
      return filterHtml(item)

    if (filterType === 'video')
      return filterVideo(item)

    return true
  }).filter((item) => {
    if (!searchKeyword)
      return true

    return item.name.includes(searchKeyword) || item.author.includes(searchKeyword) || item.description.includes(searchKeyword)
  })

  return (
    <Box className="lm-wallpaper" >
      <QuickCreator />
      <WallpaperContainer
        configurations={filterPlayList}
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
          onClose={(_, reason) => {
            if (reason === 'timeout')
              setSnackbar(false)
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={4000}
          open={snackbar}
          message={snackbarMessage}
      />
      <AlertDialog open={deleteDialogOpen} onAccept={handleDeleteAccept} onCancel={handleDeleteCancel} title="删除壁纸" content={<>请点击下面的按钮来确认你是否要进行此操作!!!<br />确认后, 该壁纸将会被移动到回收站。</>} ></AlertDialog>
    </Box>
  )
}

export default Wallpaper
