import type { Location } from 'react-router-dom'
import { Navigate, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import type { PluginPackage } from 'common/electron-common/plugin'
import './view.css'

interface ILocation extends Location {
  state: { plugin: PluginPackage }
}

export default function PluginView() {
  const { state } = useLocation() as ILocation

  if (!state || !state?.plugin)
    return <Navigate to="/" />

  return <Box sx={{ marginTop: '2rem', width: '100%', minHeight: '100%' }}>
    <iframe sandbox="allow-scripts allow-same-origin" className="plugin-view" src={`${state.plugin.frontend.entry}?ctx=${state.plugin.name}`}></iframe>
  </Box>
}
