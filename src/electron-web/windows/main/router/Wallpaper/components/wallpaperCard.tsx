import type { CardProps } from '@mui/material/Card'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import { CardActionArea, Skeleton } from '@mui/material'
import type { IWallpaperConfiguration } from 'common/electron-common/wallpaperPlayer'
import TinyText from 'electron-web/components/TinyText'
import React, { useState } from 'react'

interface WallpaperCardProps extends CardProps {
  configuration: IWallpaperConfiguration
  playing?: boolean
}

const WallpaperCard: React.FC<WallpaperCardProps> = React.memo(
  ({ configuration, playing = false, ...props }) => {
    const [isLoading, setLoading] = useState(true)
    return (
      <Card
        {...props}
        sx={{
          position: 'relative',
          minWidth: 'calc( 25% - 1rem )',
          maxWidth: 'calc( 25% - 1rem )',
        }}
        elevation={playing ? 15 : 1}
        disabled={isLoading}
        title={`
          ${configuration.name} - ${configuration.rawConfiguration?.author ?? '未知作者'}
        ${configuration.description ?? ''}
        `}
      >
        <CardActionArea>
          <Skeleton
            sx={{ display: isLoading ? 'block' : 'none' }}
            variant="rectangular"
            width={'100%'}
            height={165}
          />
          <CardMedia
            sx={{
              display: isLoading ? 'none' : 'block',
              minHeight: 165,
              maxHeight: 165,
            }}
            onLoad={() => {
              setTimeout(() => {
                setLoading(false)
              }, 500)
            }}
            onError={() => setLoading(true)}
            component="img"
            height="165"
            image={configuration.preview}
            loading="lazy"
          />

          <CardContent sx={{ fontSize: '0.9rem', padding: '8px 16px' }}>
            <TinyText
              sx={{ marginBottom: '0.05em' }}
              gutterBottom
              variant="subtitle1"
              component="div"
            >
              {configuration.rawConfiguration.author
                ? configuration.rawConfiguration.author
                : '未知作者'}
            </TinyText>
            <TinyText
              sx={{ marginBottom: '0.05em' }}
              gutterBottom
              variant="subtitle2"
              component="div"
              noWrap
            >
              {configuration.name}
            </TinyText>
            <TinyText
              sx={{ marginBottom: '0.05em' }}
              variant="subtitle1"
              color="text.secondary"
              noWrap
            >
              {configuration.description
                ? configuration.description
                : '作者没有留下描述'}
            </TinyText>
          </CardContent>
        </CardActionArea>
      </Card>
    )
  },
)

export default WallpaperCard
