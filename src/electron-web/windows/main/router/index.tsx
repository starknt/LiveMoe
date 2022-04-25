import type { RouteObject } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Container, Paper, useTheme } from '@mui/material'
import AppBar from 'electron-web/windows/main/components/AppBar'
import { useEffect, useRef } from 'react'
import useUpdate from 'electron-web/hooks/useUpdate'
import Wallpaper from './Wallpaper'
import NotMatch from './NotMatch'
import Home from './Home'

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

const routers: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        element: <Home />,
      },
      {
        index: true,
        // path: 'wallpaper',
        element: <Wallpaper />,
      },
      {
        path: '*',
        element: <NotMatch />,
      },
    ],
  },
  {
    path: '*',
    element: <NotMatch />,
  },
]

export default routers
