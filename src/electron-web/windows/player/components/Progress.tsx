import { Box, Slider, useTheme } from '@mui/material'
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect'
import useLatest from 'electron-web/hooks/useLatest'
import type { FC } from 'react'
import { memo, useCallback, useState } from 'react'
import TinyText from 'electron-web/components/TinyText'

function formatDuration(value: number) {
  const minute = Math.floor(value / 60)
  const secondLeft = value - minute * 60
  return `${minute}:${secondLeft < 9 ? `0${secondLeft}` : secondLeft}`
}

const ProgressBar: FC = memo(() => {
  const theme = useTheme()
  const initalizeProgress = useLatest(false)
  const [duration, setDuration] = useState(200)
  const [position, setPosition] = useState(32)

  useAsyncEffect(async() => {
    if (!window.livemoe || initalizeProgress.current)
      return

    window.livemoe.wallpaperPlayerService
      .onProgress()
      .then((onProgress) => {
        onProgress(({ currentTime, duration }) => {
          setDuration(Math.floor(duration))
          setPosition(Math.floor(currentTime))
        })
        initalizeProgress.current = true
      })
      .catch(err => console.error(err))
  }, [window.livemoe])

  const handlePositionChange = useCallback((position: number) => {
    setPosition(position)
    window?.livemoe?.wallpaperPlayerService.seek(position)
  }, [window.livemoe])

  return (
    <>
      <Slider
        className="non-draggable"
        size="small"
        value={position}
        min={0}
        step={1}
        max={duration}
        onChange={(_, value) => handlePositionChange(value as number)}
        sx={{
          'color': theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
          'height': 4,
          '& .MuiSlider-thumb': {
            'width': 8,
            'height': 8,
            'transition': '0.3s cubic-bezier(.47,1.64,.41,.8)',
            '&:before': {
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
            },
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0px 0px 0px 8px ${
                theme.palette.mode === 'dark'
                  ? 'rgb(255 255 255 / 16%)'
                  : 'rgb(0 0 0 / 16%)'
              }`,
            },
            '&.Mui-active': {
              width: 20,
              height: 20,
            },
          },
          '& .MuiSlider-rail': {
            opacity: 0.28,
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <TinyText>{formatDuration(position)}</TinyText>
        <TinyText>{formatDuration(duration - position)}</TinyText>
      </Box>
    </>
  )
})

export default ProgressBar
