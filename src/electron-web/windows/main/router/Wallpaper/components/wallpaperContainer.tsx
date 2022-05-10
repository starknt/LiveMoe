import React, { useCallback } from 'react'
import type { IWallpaperConfiguration, PlayRuntimeConfiguration } from 'common/electron-common/wallpaperPlayer'
import { Box } from '@mui/material'
import { isNil } from 'common/electron-common/types'
import WallpaperCard from './wallpaperCard'
import WallpaperController from './WallpaperController'

interface WallpaperContainerProps {
  playerConfiguration: PlayRuntimeConfiguration
  configurations: IWallpaperConfiguration[]
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, configuration: IWallpaperConfiguration, playing: boolean) => void
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
  if (isNil(next.playerConfiguration.wallpaperConfiguration))
    return true

  return (
    prev.playerConfiguration.wallpaperConfiguration?.id
      === next.playerConfiguration.wallpaperConfiguration?.id
    && prev.playerConfiguration.wallpaperConfiguration?.playPath
      === next.playerConfiguration.wallpaperConfiguration?.playPath
    && prev.playerConfiguration.status === next.playerConfiguration.status
    && prev.configurations.length === next.configurations.length
  )
}

const WallpaperContainer: React.FC<WallpaperContainerProps> = React.memo(
  ({ configurations, playerConfiguration, onContextMenu }) => {
    const toggle = (configuration: IWallpaperConfiguration) => {
      if (!playerConfiguration.wallpaperConfiguration)
        return

      if (
        configuration.id === playerConfiguration.wallpaperConfiguration.id
        || configuration.playPath
          === playerConfiguration.wallpaperConfiguration.playPath
      )
        window.livemoe.wallpaperPlayerService.toggle()
      else
        window.livemoe.wallpaperPlayerService.play(configuration)
    }

    const renderWallpaperCards = useCallback((configurations: IWallpaperConfiguration[]) => {
      return configurations.map((configuration) => {
        const playing = playerConfiguration.wallpaperConfiguration?.id
                  === configuration.id
                || playerConfiguration.wallpaperConfiguration?.playPath
                  === configuration.playPath

        return (
            <WallpaperCard
              onClick={() => toggle(configuration)}
              onContextMenu={(e) => {
                if (onContextMenu)
                  onContextMenu(e, configuration, playing)
              }}
              configuration={configuration}
              playing={ playing }
              key={configuration.name}
            />
        )
      })
    }, [playerConfiguration])

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
