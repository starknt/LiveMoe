import { styled } from '@mui/material/styles'

const Widget = styled('div')(({ theme }) => ({
  '--widget-gap': '12px',
  'padding': 'var(--widget-gap)',
  'width': 'calc( 100% - 2 * var(--widget-gap) )',
  'maxWidth': '100%',
  'height': 'calc( 100% - 2 * var(--widget-gap) )',
  'maxHeight': '100%',
  'margin': 'auto',
  'position': 'relative',
  'zIndex': 1,
  'backgroundColor':
    theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,.5)',
  'backdropFilter': 'blur(30px)',
}))

export default Widget
