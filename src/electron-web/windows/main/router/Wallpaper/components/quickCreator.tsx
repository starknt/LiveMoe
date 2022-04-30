import { Box, Button, Card, CardActionArea, CardContent, CardMedia } from '@mui/material'
import { useCallback, useState } from 'react'
import VideoSettingsIcon from '@mui/icons-material/VideoSettings'
import TinyText from 'electron-web/components/TinyText'
import { useTheme } from '@mui/system'
import QuickCreatorDialog from './quickCreatorDialog'

export default function QuickCreator(): JSX.Element {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Button onClick={handleOpen} sx={{ fontSize: '1.1rem' }}>点击此处快速创建壁纸</Button>
    <QuickCreatorDialog sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} open={isOpen} onClose={handleOpen} >
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', gap: '1rem', padding: '4rem', backgroundColor: theme.palette.mode === 'dark' ? '#121212' : 'inherit', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Card sx={{ width: '120px', height: '120px', display: 'flex', justifyContent: 'center' }}>
        <CardActionArea>
          <CardMedia sx={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <VideoSettingsIcon sx={{ flex: 1, color: 'blue' }} fontSize="large" />
          </CardMedia>
          <CardContent sx={{ display: 'flex', justifyContent: 'center' }} >
              视频壁纸
            </CardContent>
        </CardActionArea>
      </Card>
      <Card sx={{ width: '120px', height: '120px', display: 'flex', justifyContent: 'center' }}>
        <CardActionArea>
          <CardMedia sx={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <VideoSettingsIcon sx={{ flex: 1, color: 'blue' }} fontSize="large" />
          </CardMedia>
          <CardContent sx={{ display: 'flex', justifyContent: 'center' }} >
              微动壁纸
            </CardContent>
        </CardActionArea>
      </Card>
      <Card sx={{ width: '120px', height: '120px', display: 'flex', justifyContent: 'center' }}>
        <CardActionArea>
          <CardMedia sx={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <VideoSettingsIcon sx={{ flex: 1, color: 'blue' }} fontSize="large" />
          </CardMedia>
          <CardContent sx={{ display: 'flex', justifyContent: 'center' }} >
              网页壁纸
            </CardContent>
        </CardActionArea>
      </Card>
        </Box>
      <TinyText component="span" >*建议资源分辨率不低于1920*1080</TinyText>
      </Box>
    </QuickCreatorDialog>
  </Box>
}
