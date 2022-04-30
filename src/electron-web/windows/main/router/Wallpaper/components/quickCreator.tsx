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

  const handleShowVideoDialog = useCallback(async() => {
    const result = await livemoe.guiService.openFileSelectDialog({
      title: '请选择一个视频文件',
      filters: [
        { name: '视频文件', extensions: ['mp4'] },
      ],
      properties: ['openFile'],
    })

    console.log(result)
  }, [])

  const handleShowPictureDialog = useCallback(async() => {
    const result = await livemoe.guiService.openFileSelectDialog({
      title: '请选择一张图片',
      filters: [
        { name: '图片文件', extensions: ['jpg', 'jpeg', 'webp', 'gif', 'png'] },
      ],
      properties: ['openFile'],
    })

    console.log(result)
  }, [])

  const handleShowHtmlDialog = useCallback(async() => {
    const result = await livemoe.guiService.openFileSelectDialog({
      title: '请选择一个含有index.html文件的压缩文件',
      filters: [
        { name: '压缩文件', extensions: ['zip'] },
      ],
      properties: ['openFile'],
    })

    console.log(result)
  }, [])

  return <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Button onClick={handleOpen} sx={{ fontSize: '1.1rem' }}>点击此处快速创建壁纸</Button>
    <QuickCreatorDialog sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} open={isOpen} onClose={handleOpen} >
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', gap: '1rem', padding: '4rem', backgroundColor: theme.palette.mode === 'dark' ? '#121212' : 'inherit', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Card onClick={handleShowVideoDialog} sx={{ width: '180px', height: '160px', display: 'flex', justifyContent: 'center' }}>
              <CardActionArea>
              <CardMedia sx={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <VideoSettingsIcon sx={{ flex: 1, color: 'blue' }} fontSize="large" />
              </CardMedia>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'column' }} >
                  视频壁纸
                <TinyText sx={{ fontSize: '0.6rem' }} >*目前仅支持mp4格式的视频文件</TinyText>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card onClick={handleShowPictureDialog} sx={{ width: '180px', height: '160px', display: 'flex', justifyContent: 'center' }}>
            <CardActionArea>
              <CardMedia sx={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <VideoSettingsIcon sx={{ flex: 1, color: 'blue' }} fontSize="large" />
              </CardMedia>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'column' }} >
                  微动壁纸
                <TinyText sx={{ fontSize: '0.6rem' }} >*目前支持常见的格式的图片文件</TinyText>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card onClick={handleShowHtmlDialog} sx={{ width: '180px', height: '160px', display: 'flex', justifyContent: 'center' }}>
            <CardActionArea>
              <CardMedia sx={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <VideoSettingsIcon sx={{ flex: 1, color: 'blue' }} fontSize="large" />
              </CardMedia>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'column' }} >
                  网页壁纸
                <TinyText sx={{ fontSize: '0.6rem' }} >*目前仅支持zip格式的压缩文件</TinyText>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      <TinyText component="span" >*建议资源分辨率不低于1920*1080</TinyText>
      </Box>
    </QuickCreatorDialog>
  </Box>
}
