import Box from '@mui/material/Box'
import PluginCard from './components/PluginCard'

const Plugins: React.FC = () => {
  return <Box sx={{ marginTop: '2rem', display: 'flex' }}>
    <PluginCard></PluginCard>
  </Box>
}

export default Plugins
