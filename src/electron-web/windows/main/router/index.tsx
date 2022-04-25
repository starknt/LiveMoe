import type { RouteObject } from 'react-router-dom'
import Wallpaper from './Wallpaper'
import NotMatch from './NotMatch'
import Home from './Home'
import { Layout } from './layout'

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
