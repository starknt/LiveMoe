import {
  Box,
  ButtonBase,
  IconButton,
  Paper,
  Slider,
  SvgIcon,
  Tooltip,
} from '@mui/material'
import useOnceEffect from 'electron-web/hooks/useOnceEffect'
import { useAppDispatch } from 'electron-web/store/store'
import {
  initalizePlayerState,
  selectPlayerConfiguration,
  updateConfigurationAll,
} from 'electron-web/features/playerSlice'
import { Suspense, useEffect } from 'react'
import { useSelector } from 'react-redux'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded'
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded'
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded'
import './player.css'
import BorderLinearProgress from 'electron-web/components/BorderLinearProgress'

const RandomIcon = (props: any) => {
  return (
    <SvgIcon {...props} viewBox="0 0 1024 1024">
      <path
        d="M170.666667 725.333333a42.666667 42.666667 0 0 1 0-85.333333h85.333333l128-128-128-128H170.666667a42.709333 42.709333 0 0 1 0-85.333333h128l170.666666 170.666666 170.666667-170.666666h85.333333V213.333333l170.666667 128.042667L725.333333 469.333333V384h-42.666666l-128 128 128 128h42.666666v-85.333333l170.666667 128-170.666667 128v-85.333334h-85.333333l-170.666667-170.666666-170.666666 170.666666H170.666667z"
        p-id="2659"
      ></path>
    </SvgIcon>
  )
}

export default function MinPlayer() {
  const dispath = useAppDispatch()
  const configuration = useSelector(selectPlayerConfiguration)

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

  return (
    <Paper style={{ height: '100vh' }}>
      <Suspense fallback={<>加载中...</>}>
        <Box
          display="grid"
          gridTemplateColumns="repeat(20, 1fr)"
          gridTemplateRows="repeat(6, 1fr)"
          sx={{ height: '100%', borderRadius: 'inherit', overflow: 'hidden' }}
        >
          <Box
            sx={{
              gridColumn: '5 / 21',
              gridRow: '1 / 1',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Slider
              className="non-draggable"
              size="small"
              defaultValue={70}
              valueLabelDisplay="auto"
            />
          </Box>
          {/* Poster 壁纸的封面图 */}
          <Box
            sx={{ overflow: 'hidden', borderRadius: 'inherit' }}
            gridRow="1 / 7"
            gridColumn="1 / 5"
          >
            {configuration.configuration.wallpaperConfiguration
              ?.rawConfiguration.preview
              ? (
              <img
                src={
                  configuration.configuration.wallpaperConfiguration
                    ?.rawConfiguration.preview
                }
                alt="poster"
              />
                )
              : (
              <img src="https://picsum.photos/200/300" alt="poster" />
                )}
          </Box>
          {/* 控制器 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            gridRow="2 / 6"
            gridColumn="5 / 11"
          >
            <Tooltip followCursor placement="top" title="播放上一张壁纸">
              <IconButton
                sx={{
                  ':hover': {
                    color: 'skyblue',
                  },
                }}
                className="non-draggable"
              >
                <SkipPreviousRoundedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              followCursor
              placement="top"
              title={
                configuration.configuration.status === 'playing'
                  ? '暂停'
                  : '播放'
              }
            >
              <IconButton
                sx={{
                  ':hover': {
                    color: 'skyblue',
                  },
                }}
                className="non-draggable"
              >
                {configuration.configuration.status === 'playing'
                  ? (
                  <PauseRoundedIcon />
                    )
                  : (
                  <PlayArrowRoundedIcon />
                    )}
              </IconButton>
            </Tooltip>
            <Tooltip followCursor placement="top" title="播放下一张壁纸">
              <IconButton
                sx={{
                  ':hover': {
                    color: 'skyblue',
                  },
                }}
                className="non-draggable"
              >
                <SkipNextRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
          {/* 设置 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            gridRow="2 / 6"
            gridColumn="11 / 16"
          >
            <ButtonBase
              sx={{
                'padding': '2px',
                'paddingRight': '4px',
                ':hover': {
                  color: 'skyblue',
                },
              }}
              className="non-draggable"
            >
              <VolumeDownRoundedIcon />
            </ButtonBase>
            <Slider
              className="non-draggable"
              size="small"
              defaultValue={70}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            gridRow="2 / 6"
            gridColumn="16 / 20"
          >
            <IconButton className="non-draggable">
              <RandomIcon />
            </IconButton>
          </Box>
        </Box>
      </Suspense>
    </Paper>
  )
}
