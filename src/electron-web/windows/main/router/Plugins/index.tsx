import { useState } from 'react'
import Box from '@mui/material/Box'
import useAsyncEffect from 'electron-web/hooks/useAsyncEffect'
import type { PluginPackage } from 'common/electron-common/plugin'
import { Backdrop, CircularProgress } from '@mui/material'
import PluginCard from './components/PluginCard'

const Plugins: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginPackage[]>([])

  useAsyncEffect(async() => {
    if (!window.livemoe)
      return

    const service = await window.livemoe.serverService.getServerService('lm:plugin')

    service?.sendMessage('plugin').then((plugins) => {
      if (Array.isArray(plugins))
        setPlugins(plugins)
    }).catch(err => console.error(err))
  }, [window.livemoe])

  if (plugins && !plugins.length) {
    return <Backdrop
        open={plugins.length === 0}
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
  }

  return <Box sx={{ marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
    {plugins.map((plugin) => {
      return <PluginCard key={plugin.name} configuration={plugin} name={plugin.displayName} description={plugin.description} />
    })}
  </Box>
}

export default Plugins
