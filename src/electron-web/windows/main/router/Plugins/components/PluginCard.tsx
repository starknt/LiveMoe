import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'

export interface PluginCardProps {
  name: string
  description: string
  preview: string
}

const PluginCard: React.FC<PluginCardProps> = ({ name }) => {
  return <Card>

    <CardActionArea></CardActionArea>
  </Card>
}

export default PluginCard
