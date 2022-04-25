import type { IWallpaperConfiguration } from 'common/electron-common/wallpaperPlayer'
import React, { useCallback, useEffect, useState } from 'react'
import { Flipped, Flipper } from 'react-flip-toolkit'
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import ButtonGroup from 'electron-web/components/Button'
import Input from 'electron-web/components/Input'
import { useSelector } from 'react-redux'
import { selectPlayList, selectPlayerConfiguration } from 'electron-web/features/playerSlice'
import { Backdrop, CircularProgress, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import WallpaperContainer from './components/wallpaperContainer'
import './index.css'

interface IWallpaperItem {
  configuration: IWallpaperConfiguration
  index: number
}

interface IWallpaperGrid {
  configurations: IWallpaperConfiguration[]
}

const shouldFlip = (index: number) => (prev: number, current: number) => {
  return index === prev || index === current
}

const WallpaperItem: React.FC<IWallpaperItem> = ({ configuration, index }) => {
  return (
    <Flipped>
      <div draggable className="lm-wallpaper-item" key={configuration.name}>
        <Flipped inverseFlipId="list" shouldFlip={shouldFlip(index)}>
          <div className="relative">
            <img
              className="lm-wallpaper-item-img"
              alt={configuration.rawConfiguration.description}
              src={configuration.rawConfiguration.preview}
              loading="lazy"
            />
          </div>
        </Flipped>
        <div className="lm-wallpaper-item-info">
          <p className="lm-wallpaper-item-title">
            壁纸名字: {configuration.name}
          </p>
          <p className="lm-wallpaper-item-desc">
            壁纸描述:{' '}
            {configuration.rawConfiguration.description
              ?? '这个作者没有留下描述'}
          </p>
        </div>
        <div className="lm-wallpaper-item-action"></div>
        {/* <WallpaperRemoveButton id={index} onChange={(e) => console.warn(e)} /> */}
      </div>
    </Flipped>
  )
}

const WallpaperExtraItem: React.FC<IWallpaperItem> = ({
  configuration,
  index,
}) => {
  return (
    <div className="lm-wallpaper-item" key={configuration.name}>
      <div className="relative">
        {/* <iframe
      title={configuration.name}
      src={configuration.playPath}
      loading="lazy"
      className="absolute top-0 left-0 wallpaperIf"
    /> */}
        <img
          className="lm-wallpaper-item-img"
          alt={configuration.rawConfiguration.description}
          src={configuration.rawConfiguration.preview}
          loading="lazy"
        />
      </div>
      <div className="lm-wallpaper-info">
        <p className="lm-wallpaper-item-title">
          壁纸名字: {` ${configuration.name}`}
        </p>
        <p className="lm-wallpaper-item-desc">
          壁纸描述:
          {` ${
            configuration.rawConfiguration.description || '这个作者没有留下描述'
          }`}
        </p>
      </div>
    </div>
  )
}

const WallpaperGrid: React.FC<IWallpaperGrid> = ({ configurations }) => {
  const [display, setDisplay] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    const localDisplay = localStorage.getItem('display')

    if (localDisplay) {
      const _display = localDisplay === 'grid' ? 'grid' : 'list'
      setDisplay(_display)
    }
  }, [])

  useEffect(() => {
    return () => {
      localStorage.setItem('display', display)
    }
  }, [display])

  return (
    <Flipper flipKey={`lm-wallpaper-${display}`}>
      <div className="lm-wallpaper-view">
        <div className="lm-wallpaper-view-right">
          <Input
            className="lm-wallpaper-view-right-filter"
            Icon={<FilterAltRoundedIcon />}
            onChange={v => setFilter(v)}
          />
          <div className="lm-wallpaper-view-sort">
            <ButtonGroup>
              <ButtonGroup.Button
                select={display === 'list'}
                Icon={<ViewListRoundedIcon />}
                onClick={() => setDisplay('list')}
              />
              <ButtonGroup.Button
                select={display === 'grid'}
                Icon={<GridViewRoundedIcon />}
                onClick={() => setDisplay('grid')}
              />
            </ButtonGroup>
          </div>
        </div>
      </div>
      <Flipped flipId="list" stagger>
        <div className={`lm-wallpaper-${display}`}>
          {configurations
            .filter(
              v =>
                v.name.toLowerCase().includes(filter.toLowerCase())
                || v.rawConfiguration.description
                  .toLowerCase()
                  .includes(filter.toLowerCase()),
            )
            .map((configuration, index) => {
              return (
                <Flipped
                  key={configuration.playPath}
                  flipId={index}
                  stagger={`list-item-${index}`}
                  delayUntil={`list-item-${index - 1}`}
                >
                  <WallpaperItem index={index} configuration={configuration} />
                </Flipped>
              )
            })}
        </div>
      </Flipped>
    </Flipper>
  )
}

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
    </div>
  )
}

export default Wallpaper
