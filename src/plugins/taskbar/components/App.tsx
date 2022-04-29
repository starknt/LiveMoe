import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import { Box } from '@mui/material'
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect'
import { useCallback, useState } from 'react'
import type { LiveMoe } from 'livemoe'
import type { TASKBAR_APPEARANCE } from 'common/electron-common/taskbar'
import { BLURBEHIND_APPEARANCE, FLUENT_APPEARANCE, REGULAR_APPEARANCE, START_APPEARANCE, toARGB, toRGBA } from 'common/electron-common/taskbar'
import type { ColorResult, RGBColor } from 'react-color'
import { AlphaPicker, TwitterPicker } from 'react-color'
import './app.css'

const mapAppearance = (appearance: string) => {
  switch (appearance) {
    case 'FLUENT_APPEARANCE':
      return FLUENT_APPEARANCE
    case 'BLURBEHIND_APPEARANCE':
      return BLURBEHIND_APPEARANCE
    case 'START_APPEARANCE':
      return START_APPEARANCE
    case 'REGULAR_APPEARANCE':
      return REGULAR_APPEARANCE
    default:
      return START_APPEARANCE
  }
}

const mapAppearanceToString = (appearance: TASKBAR_APPEARANCE) => {
  switch (appearance.ACCENT) {
    case FLUENT_APPEARANCE.ACCENT:
      return 'FLUENT_APPEARANCE'
    case BLURBEHIND_APPEARANCE.ACCENT:
      return 'BLURBEHIND_APPEARANCE'
    case START_APPEARANCE.ACCENT:
      return 'START_APPEARANCE'
    case REGULAR_APPEARANCE.ACCENT:
      return 'REGULAR_APPEARANCE'
    default:
      return 'START_APPEARANCE'
  }
}

const startAppearance = toRGBA(START_APPEARANCE.COLOR)

export default function App() {
  const [color, setColor] = useState<RGBColor>(() => (
    {
      r: startAppearance.r,
      g: startAppearance.g,
      b: startAppearance.b,
      a: startAppearance.a,
    }
  ))
  const [alpha, setAlpha] = useState<RGBColor>(() => startAppearance)
  const [style, setStyle] = useState<TASKBAR_APPEARANCE>(START_APPEARANCE)
  const [service, setService] = useState<LiveMoe.WrapperService | null>(null)
  const _window = window.parent.window.livemoe

  useAsyncEffect(async() => {
    if (!_window)
      return

    const service = await _window.serverService.getServerService('lm:taskbar')

    setService(service)

    service?.listeMessage('style').then((onStyleChange) => {
      onStyleChange((style) => {
        setStyle(style)
        setColor(toRGBA(style.COLOR))
      })
    }).catch(err => console.error(err))

    service?.sendMessage('style').then((style) => {
      setStyle(style)
    }).catch(err => console.error(err))
  }, [_window])

  const handleChangeACCENT = useCallback((_: any, value: string) => {
    const appearance = mapAppearance(value)
    appearance.COLOR = toARGB(`rgba(${color.r}, ${color.g}, ${color.b}, ${alpha.a})`) ?? appearance.COLOR

    service?.sendMessage('style', appearance)
  }, [service, color, alpha])

  const handleChangeCOLOR = useCallback((_color: ColorResult) => {
    setColor(_color.rgb)

    const appearance = style
    // appearance.COLOR = toARGB(`rgba(${color.r}, ${color.g}, ${color.b}, ${alpha.a})`) ?? appearance.COLOR

    // service?.sendMessage('style', appearance)
  }, [color, alpha, style, service])

  const handleChangeAlpha = useCallback((_color: ColorResult) => {
    setAlpha(_color.rgb)

    const appearance = style
    // appearance.COLOR = toARGB(`rgba(${color.r}, ${color.g}, ${color.b}, ${alpha.a})`) ?? appearance.COLOR

    // service?.sendMessage('style', appearance)
  }, [color, alpha, style, service])

  return (
  <Box sx={{ display: 'flex', flexDirection: 'column', margin: '2rem', gap: '1rem', zIndex: 9999 }}>
    <FormControl>
      <FormLabel focused id="demo-row-radio-buttons-group-label">任务栏风格</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        onChange={handleChangeACCENT}
        value={mapAppearanceToString(style)}
      >
        <FormControlLabel value="START_APPEARANCE" control={<Radio />} label="正常" />
        <FormControlLabel value="REGULAR_APPEARANCE" control={<Radio />} label="透明" />
        <FormControlLabel value="BLURBEHIND_APPEARANCE" control={<Radio />} label="毛玻璃" />
        <FormControlLabel value="FLUENT_APPEARANCE" control={<Radio />} label="亚克力" />
      </RadioGroup>
      </FormControl>
      <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <FormLabel focused>任务栏颜色</FormLabel>
        <TwitterPicker
          color={ color }
          onChangeComplete={handleChangeCOLOR}
          triangle="hide"
        />
      </Box>
      <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <FormLabel focused>透明度</FormLabel>
        <AlphaPicker onChange={handleChangeAlpha} color={{ ...color, a: alpha.a }} />
      </Box>
  </Box>
  )
}
