import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded'
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded'
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded'
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded'
import PlaylistPlayOutlinedIcon from '@mui/icons-material/PlaylistPlayOutlined'
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded'
import { Paper, SvgIcon, Tooltip } from '@mui/material'
import type { PlayRuntimeConfiguration } from 'common/electron-common/wallpaperPlayer'
import Widget from 'electron-web/components/Widget'
import type {
  FC,
  PropsWithChildren,
  ReactNode,
} from 'react'
import {
  memo,
  useCallback,
  useState,
} from 'react'
import Progress from './Progress'

const CoverImage = styled('div')({
  'display': 'flex',
  'justifyContent': 'center',
  'alignItems': 'center',
  'width': 108,
  'objectFit': 'cover',
  'overflow': 'hidden',
  'flexShrink': 0,
  'borderRadius': '6px',
  'backgroundColor': 'rgba(0,0,0,0.08)',
  '& > img': {
    width: '100%',
  },
})

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

interface PlayerProps {
  configuration: PlayRuntimeConfiguration
}

function handleUpdate(
  prev: Readonly<PropsWithChildren<PlayerProps & { children?: ReactNode }>>,
  next: Readonly<PropsWithChildren<PlayerProps & { children?: ReactNode }>>,
) {
  const pConfiguration = prev.configuration
  const nConfiguration = next.configuration
  console.log('handleUpdate', pConfiguration, nConfiguration)
  try {
    return (
      pConfiguration.status === nConfiguration.status
      && pConfiguration.volume === nConfiguration.volume
      && JSON.stringify(pConfiguration.wallpaperConfiguration)
        === JSON.stringify(nConfiguration.wallpaperConfiguration)
      && pConfiguration.mode === nConfiguration.mode
    )
  }
  catch (error) {
    return false
  }
}

const NormalPlayer: FC<PlayerProps> = memo(({ configuration }) => {
  const theme = useTheme()
  const [volume, setVolume] = useState(configuration.volume ?? 50)
  console.log('NormalPlayer', configuration)
  const handlePrev = useCallback(() => {
    window.livemoe.wallpaperPlayerService.prev()
  }, [])

  const handlePlayPause = useCallback(() => {
    if (configuration.status === 'playing')
      window.livemoe.wallpaperPlayerService.pause()
    else
      window.livemoe.wallpaperPlayerService.play()
  }, [configuration])

  const handleNext = useCallback(() => {
    window.livemoe.wallpaperPlayerService.next()
  }, [])

  const renderPlayModeText = useCallback(() => {
    if (configuration.mode === 'random')
      return '随机播放'

    if (configuration.mode === 'order')
      return '顺序播放'

    if (configuration.mode === 'single')
      return '循环播放'

    if (configuration.mode === 'list-loop')
      return '列表循环'

    return '循环播放'
  }, [])

  const renderPlayModeIcon = useCallback(() => {
    if (configuration.mode === 'random')
      return <RandomIcon />

    if (configuration.mode === 'order')
      return <PlaylistPlayOutlinedIcon />

    if (configuration.mode === 'list-loop')
      return <RepeatRoundedIcon />

    if (configuration.mode === 'single')
      return <RepeatOneRoundedIcon />

    return <RepeatOneRoundedIcon />
  }, [])

  const handlePlayModeChange = useCallback(() => {}, [configuration])

  const handleVolumeChange = useCallback((_, value: number | number[]) => {
    window?.livemoe?.wallpaperPlayerService.volume(value as number)
  }, [])

  const mainIconColor = theme.palette.mode === 'dark' ? '#fff' : '#000'
  const lightIconColor
    = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  return (
    <Paper
      sx={{
        height: '100%',
        backgroundColor: 'transparent',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <Widget>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CoverImage>
            <img
              alt="poster"
              src={
                configuration?.wallpaperConfiguration?.preview
                ?? 'https://picsum.photos/367/167'
              }
            />
          </CoverImage>
          <Box sx={{ ml: 1.5, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              {'未知作者'}
            </Typography>
            <Typography noWrap>
              <b>{configuration.wallpaperConfiguration?.name ?? '未知标题'}</b>
            </Typography>
            <Typography fontSize="0.85rem" noWrap letterSpacing={-0.25}>
              {configuration.wallpaperConfiguration?.description
                ? configuration.wallpaperConfiguration?.description
                : '作者没有描述该壁纸哦'}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Progress />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: -1,
          }}
        >
          <IconButton disabled className="non-draggable">
            {/* noop */}
          </IconButton>
          <IconButton
            sx={{
              ':disabled': {
                color: 'GrayText',
              },
            }}
            disabled={!!configuration.disabled}
            className="non-draggable"
            onClick={handlePrev}
          >
            <SkipPreviousRoundedIcon
              fontSize="large"
              htmlColor={mainIconColor}
            />
          </IconButton>
          <IconButton
            disabled={!!configuration.disabled}
            className="non-draggable"
            onClick={handlePlayPause}
          >
            {configuration.status === 'paused'
              ? (
              <PlayArrowRounded
                sx={{ fontSize: '3rem' }}
                htmlColor={mainIconColor}
              />
                )
              : (
              <PauseRounded
                sx={{ fontSize: '3rem' }}
                htmlColor={mainIconColor}
              />
                )}
          </IconButton>
          <IconButton
            sx={{
              ':disabled': {
                color: 'GrayText',
              },
            }}
            disabled={!!configuration.disabled}
            className="non-draggable"
            onClick={handleNext}
          >
            <SkipNextRoundedIcon fontSize="large" htmlColor={mainIconColor} />
          </IconButton>
          <Tooltip title={renderPlayModeText()} placement="top">
            <IconButton
              onClick={handlePlayModeChange}
              className="non-draggable"
            >
              {renderPlayModeIcon()}
            </IconButton>
          </Tooltip>
        </Box>
        <Stack
          spacing={2}
          direction="row"
          sx={{ mb: 1, px: 1 }}
          alignItems="center"
        >
          <VolumeDownRounded htmlColor={lightIconColor} />
          <Slider
            className="non-draggable"
            min={0}
            step={1}
            max={100}
            defaultValue={configuration.volume}
            valueLabelDisplay="auto"
            value={volume}
            sx={{
              'color':
                theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
              '& .MuiSlider-track': {
                border: 'none',
              },
              '& .MuiSlider-thumb': {
                'width': 24,
                'height': 24,
                'backgroundColor': '#fff',
                '&:before': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                },
                '&:hover, &.Mui-focusVisible, &.Mui-active': {
                  boxShadow: 'none',
                },
              },
            }}
            onChange={(_, value) => {
              setVolume(value as number)
            }}
            onChangeCommitted={handleVolumeChange}
          />
          <VolumeUpRounded htmlColor={lightIconColor} />
        </Stack>
      </Widget>
    </Paper>
  )
})

export default NormalPlayer
