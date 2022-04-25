import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TinyText from 'electron-web/components/TinyText'
import React from 'react'

const SettingWallpaperStore: React.FC<{ path?: string }> = ({
  children,
  path,
}) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          columnGap: '1rem',
          justifyContents: 'flex-start',
          maxWidth: '90%',
        }}
      >
        <TinyText variant="span" noWrap>
          当前目录:
        </TinyText>
        <Typography sx={{ flex: 1 }} noWrap>
          {path ?? '加载中...'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: '1rem', mt: '1rem' }}>
        {React.Children.map(children, (child: React.ReactNode) => {
          if (!React.isValidElement(child))
            return ''

          return React.cloneElement(child as React.ReactElement, {
            ...(child as React.ReactElement).props,
            className: 'non-draggable',
          })
        })}
      </Box>
    </Box>
  )
}

export default SettingWallpaperStore
