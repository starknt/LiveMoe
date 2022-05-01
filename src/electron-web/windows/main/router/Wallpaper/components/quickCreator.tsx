import { Box, Button, Card, CardActionArea, CardContent, CardMedia, DialogActions, IconButton, TextField } from '@mui/material'
import { useCallback, useState } from 'react'
import VideoSettingsIcon from '@mui/icons-material/VideoSettings'
import TinyText from 'electron-web/components/TinyText'
import { useTheme } from '@mui/system'
import AddIcon from '@mui/icons-material/Add'
import QuickCreatorDialog from './quickCreatorDialog'
import WallpaperConfigurationDialog from './quickCreatorWallpaperConfig'

export default function QuickCreator(): JSX.Element {
  const theme = useTheme()
  const [isCreator, setIsCreator] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenForm, setIsOpenForm] = useState(false)

  const [targetPath, setTargetPath] = useState('')
  const [targetType, setTargetType] = useState('')

  // 配置
  const [preview, setPreview] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleOpenForm = useCallback(() => {
    setIsOpenForm(prev => !prev)
  }, [])

  const handleUploadPreview = useCallback(() => {
    const input = document.createElement('input')

    input.type = 'file'

    input.accept = 'image/*'

    input.addEventListener('change', () => {
      const file = input.files ? input.files[0] : null

      if (file)
        setPreview(file)
    })

    input.click()
  }, [])

  const handleShowVideoDialog = useCallback(async() => {
    const result = await livemoe.guiService.openFileSelectDialog({
      title: '请选择一个视频文件',
      filters: [
        { name: '视频文件', extensions: ['mp4'] },
      ],
      properties: ['openFile'],
    })

    if (!result)
      return

    if (Array.isArray(result) && result.length > 0) {
      const file = result[0]
      const res = await livemoe.guiService.checkFileExists(file)

      if (!res)
        return
      handleOpen()
      handleOpenForm()

      setTargetPath(file)
      setTargetType('video')

      console.log(res)
    }
  }, [])

  const handleShowPictureDialog = useCallback(async() => {
    const result = await livemoe.guiService.openFileSelectDialog({
      title: '请选择一张图片',
      filters: [
        { name: '图片文件', extensions: ['jpg', 'jpeg', 'webp', 'gif', 'png'] },
      ],
      properties: ['openFile'],
    })

    if (!result)
      return

    if (Array.isArray(result) && result.length > 0) {
      const file = result[0]
      const res = await livemoe.guiService.checkFileExists(file)

      if (!res)
        return
      handleOpen()
      handleOpenForm()

      setTargetPath(file)
      setTargetType('picture')

      console.log(res)
    }

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

    if (!result)
      return

    if (Array.isArray(result) && result.length > 0) {
      const file = result[0]
      const res = await livemoe.guiService.checkFileExists(file)

      if (!res)
        return
      handleOpen()
      handleOpenForm()

      setTargetPath(file)
      setTargetType('html')

      console.log(res)
    }

    console.log(result)
  }, [])

  const handleCreateWallpaper = useCallback(() => {
    if (targetPath && targetType && name && description && preview) {
      if (targetType === 'video') {
        livemoe.wallpaperService.createVideoWallpaper({
          type: 1,
          used: 0,
          url: '',
          _id: '',
          tags: [],
          createTime: Date.now(),
          accessibility: 'private',
          version: 0,
          preview: preview.path,
          uploadTime: Date.now(),
          author: '',
          name,
          description,
          src: targetPath,
        }).then((v) => {
          if (v)
            console.log(v)
        }).catch(err => console.error(err)).finally(() => {
          setIsCreator(false)
        })
      }
      else if (targetType === 'picture') {
        livemoe.wallpaperService.createImageWallpaper({
          type: 2,
          used: 0,
          url: '',
          _id: '',
          tags: [],
          createTime: Date.now(),
          uploadTime: Date.now(),
          accessibility: 'private',
          version: 0,
          preview: preview.path,
          author: '',
          name,
          description,
          src: targetPath,
        }).catch(err => console.error(err)).finally(() => {
          setIsCreator(false)
        })
      }
      else if (targetType === 'html') {
        livemoe.wallpaperService.createHtmlWallpaper({
          type: 2,
          used: 0,
          url: '',
          _id: '',
          tags: [],
          createTime: Date.now(),
          uploadTime: Date.now(),
          accessibility: 'private',
          version: 0,
          preview: preview.path,
          author: '',
          name,
          description,
          src: targetPath,
        }).catch(err => console.error(err)).finally(() => {
          setIsCreator(false)
        })
      }

      setIsCreator(true)
      setTargetPath('')
      setTargetType('')
      setPreview(null)
      setName('')
      setDescription('')
    }

    handleOpenForm()
  }, [targetPath, targetType, preview, name, description])

  return <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Button disabled={isCreator} onClick={handleOpen} sx={{ fontSize: '1.1rem' }}> {!isCreator ? '点击此处快速创建壁纸' : '正在创建壁纸...'}</Button>
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
    <WallpaperConfigurationDialog disableEscapeKeyDown title="请先填写一下新壁纸的信息" content="" open={isOpenForm}>
      <Box sx={{ mt: '1rem', gap: '1rem', display: 'flex', flexDirection: 'column' }}>
        <TextField label="壁纸名称" value={name} onChange={e => setName(e.target.value)} />
        <TextField label="壁纸描述" placeholder="简单的描述一下你的壁纸吧" multiline onChange={e => setDescription(e.target.value)} />
        <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <TinyText component="span" >封面图: </TinyText>
          {
            preview
              ? <Box sx={{ overflow: 'hidden', borderRadius: '4px' }}><img src={preview.path} style={{ height: '106px', display: 'block' }} /></Box>
              : <IconButton onClick={handleUploadPreview} sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '106px', border: `1px dashed ${theme.palette.mode === 'dark' ? '#fff' : '#333'}`, borderRadius: '4px' }} >
                  <AddIcon />
                </IconButton>
          }

        </Box>
      </Box>
      <DialogActions>
        <Button disabled={ !(!!name && !!description && !!preview) } onClick={handleCreateWallpaper}>创建壁纸</Button>
        <Button onClick={handleOpenForm}>取消</Button>
      </DialogActions>
    </WallpaperConfigurationDialog>
  </Box>
}
