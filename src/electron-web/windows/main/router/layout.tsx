import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import useUpdate from 'electron-web/hooks/useUpdate'
import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import AppBar from '../components/AppBar'

export function Layout() {
  const theme = useTheme()
  const ref = useRef<HTMLDivElement | null>(null)
  const forceUpdate = useUpdate()

  useEffect(() => {
    forceUpdate()
  }, [ref.current])

  return (
    <Paper className="overflow-hidden" sx={{ borderRadius: 'inherit' }}>
      <AppBar ref={ref} />
      <Paper
        style={{
          borderRadius: 0,
          display: 'flex',
          minHeight: `calc( 100vh - ${
            (ref.current?.getBoundingClientRect().height ?? 70) - 2
          }px )`,
          marginTop: `${(ref.current?.getBoundingClientRect().height ?? 70) - 2}px`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? '#f1f3f5'
              : theme.palette.background.default,
        }}
      >
        <Container>
          <Outlet />
        </Container>
      </Paper>
    </Paper>
  )
}
