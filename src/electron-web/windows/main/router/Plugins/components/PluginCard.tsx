import { CardContent, CardMedia } from '@mui/material'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import classNames from 'classnames'
import type { PluginPackage } from 'common/electron-common/plugin'
import TinyText from 'electron-web/components/TinyText'
import { useNavigate } from 'react-router-dom'
import './card.css'

export interface PluginCardProps {
  name: string
  description: string
  preview?: string
  configuration: PluginPackage
}

const PluginCard: React.FC<PluginCardProps> = ({ name, preview, configuration }) => {
  const navigation = useNavigate()
  const cardClasses = classNames(preview ? 'preview' : 'default-background')

  return <Card sx={{ width: '32%' }} onClick={() => navigation(`/plugin-view/${name}`, {
    state: {
      plugin: configuration,
    },
  })}
  >
    <CardActionArea sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
          <CardMedia>我是背景图</CardMedia>
          <CardContent sx={{ fontSize: '0.9rem', padding: '8px 16px', display: 'flex', justifyContent: 'center' }}>
          <TinyText component="span">{name}</TinyText>
          </CardContent>
    </CardActionArea>
  </Card>
}

export default PluginCard
