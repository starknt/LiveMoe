import React, { useCallback } from 'react'
import type { IWallpaperConfiguration, PlayRuntimeConfiguration } from 'common/electron-common/wallpaperPlayer'
import { Box } from '@mui/material'
import WallpaperCard from './wallpaperCard'
import WallpaperController from './WallpaperController'

interface WallpaperContainerProps {
  playerConfiguration: PlayRuntimeConfiguration
  configurations: IWallpaperConfiguration[]
  onContextMenu?: (event: React.MouseEvent) => void
}

function handleUpdate(
  prev: Readonly<
    React.PropsWithChildren<
      WallpaperContainerProps & { children?: React.ReactNode }
    >
  >,
  next: Readonly<
    React.PropsWithChildren<
      WallpaperContainerProps & { children?: React.ReactNode }
    >
  >,
) {
  return (
    prev.playerConfiguration.wallpaperConfiguration?.id
      === next.playerConfiguration.wallpaperConfiguration?.id
    && prev.playerConfiguration.wallpaperConfiguration?.playPath
      === next.playerConfiguration.wallpaperConfiguration?.playPath
    && prev.playerConfiguration.status === next.playerConfiguration.status
  )
}

const WallpaperContainer: React.FC<WallpaperContainerProps> = React.memo(
  ({ configurations, playerConfiguration, onContextMenu }) => {
    const play = (configuration: IWallpaperConfiguration) => {
      if (
        configuration.id === playerConfiguration.wallpaperConfiguration?.id
        || configuration.playPath
          === playerConfiguration.wallpaperConfiguration?.playPath
      ) {
        if (playerConfiguration.status === 'playing')
          window.livemoe.wallpaperPlayerService.pause()
        else
          window.livemoe.wallpaperPlayerService.play()
      }
      else {
        window.livemoe.wallpaperPlayerService.play(configuration)
      }
    }

    const renderWallpaperCards = useCallback((configurations: IWallpaperConfiguration[]) => {
      return configurations.map((configuration) => {
        return (
            <WallpaperCard
              onClick={() => play(configuration)}
              onContextMenu={onContextMenu}
              configuration={configuration}
              playing={
                playerConfiguration.wallpaperConfiguration?.id
                  === configuration.id
                || playerConfiguration.wallpaperConfiguration?.playPath
                  === configuration.playPath
              }
              key={configuration.name}
            />
        )
      })
    }, [])

    return (
      <>
        <WallpaperController />
        <Box sx={{ width: '100%', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {renderWallpaperCards(configurations)}
        </Box>
      </>
    )
  },
  handleUpdate,
)

export default WallpaperContainer
