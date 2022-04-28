import type { Location } from 'react-router-dom'
import { Navigate, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import type { PluginPackage } from 'common/electron-common/plugin'

interface ILocation extends Location {
  state: { plugin: PluginPackage }
}

export default function PluginView() {
  const { state } = useLocation() as ILocation

  if (!state || !state?.plugin)
    return <Navigate to="/" />

  return <Box sx={{ marginTop: '2rem' }}>
    <iframe className="plugin-view" src={state.plugin.frontend.entry}></iframe>
  </Box>
}
