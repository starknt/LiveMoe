import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from '@mui/material'
import type { IWallpaperConfiguration } from 'common/electron-common/wallpaperPlayer'
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect'
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded'
import { useEffect, useState } from 'react'
import { useAppStore } from 'electron-web/store/store'
import { PlayerInitalizeState } from 'electron-web/features/playerSlice'

export default function Status() {
  const store = useAppStore()

  const [playing, setPlaying] = useState<IWallpaperConfiguration | null>(null)

  useEffect(() => {
    if (store.playerConfiguration.state === PlayerInitalizeState.INITIALIZING) {
      setPlaying(
        store.playerConfiguration.configuration.wallpaperConfiguration,
      )
    }
  }, [store.playerConfiguration])

  useAsyncEffect(async() => {
    if (!window.livemoe)
      return

    const onPlay = await window.livemoe.wallpaperPlayerService.onPlay()

    onPlay((configuration) => {
      setPlaying(configuration)
    })
  }, [window.livemoe])

  return (
    <MenuItem disabled>
      <ListItemIcon>
        <DesktopWindowsRoundedIcon />
      </ListItemIcon>
      <ListItemText>
        <Typography variant="inherit" noWrap>
          {playing?.name ?? '无正在播放的壁纸'}
        </Typography>
      </ListItemText>
    </MenuItem>
  )
}
