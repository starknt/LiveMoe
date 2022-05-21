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
import { Paper, Tooltip } from '@mui/material'
import type { PlayerRuntimeConfiguration } from 'common/electron-common/wallpaperPlayer'
import Widget from 'electron-web/components/Widget'
import type { FC } from 'react'
import { memo, useCallback, useState } from 'react'
import { PlayerRandomIcon } from 'electron-web/styles/icons/PlayerRandomIcon'
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect'
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

interface PlayerProps {
  configuration: PlayerRuntimeConfiguration
}

const NormalPlayer: FC<PlayerProps> = memo(({ configuration }) => {
  const theme = useTheme()
  const [volume, setVolume] = useState(configuration.volume ?? 50)
  const handlePrev = useCallback(() => {
    window.livemoe.wallpaperPlayerService.prev()
  }, [])
  const [previewPath, setPreviewPath] = useState('')

  useAsyncEffect(async() => {
    if (!window.livemoe || !configuration.wallpaperConfiguration)
      return

    const { preview, resourcePath } = configuration.wallpaperConfiguration

    if (await window.livemoe.guiService.checkFileExists(preview))
      setPreviewPath(preview)
    else if (await window.livemoe.guiService.checkFileExists(`${resourcePath}//${preview}`))
      setPreviewPath(`${resourcePath}//${preview}`)
  }, [window.livemoe, configuration.wallpaperConfiguration])

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
      return <PlayerRandomIcon />

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
                previewPath ?? 'https://picsum.photos/367/167'
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
}, (prevProps, nextProps) => {
  return prevProps.configuration.mode === nextProps.configuration.mode
  && prevProps.configuration.volume === nextProps.configuration.volume
  && prevProps.configuration.status === nextProps.configuration.status
  && prevProps.configuration.disabled === nextProps.configuration.disabled
  && prevProps.configuration.wallpaperConfiguration?.id === nextProps.configuration.wallpaperConfiguration?.id
})

export default NormalPlayer
