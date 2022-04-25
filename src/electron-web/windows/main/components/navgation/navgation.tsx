import { List, ListItemButton, ListItemText, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import './navgation.css'

const pages = ['壁纸', '组件']

const NavTypography = styled(Typography)(() => ({
  fontSize: '1.1rem',
  fontWeight: 500,
}))

export interface INavgationItem {
  title: string
  to: string
}

export interface INavgationProps {
  items?: INavgationItem[]
}

const Navigation: React.FC<INavgationProps> = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return <List sx={{ display: 'flex', gap: '1rem' }} component="nav">
      {
        pages.map((page, index) => {
          return <Link to="/" key={page}>
            <ListItemButton sx={{ padding: '0px 16px' }} selected={selectedIndex === index} onClick={() => setSelectedIndex(index)} className="non-draggable">
            <ListItemText>
              <NavTypography>{page}</NavTypography>
            </ListItemText>
            </ListItemButton>
          </Link>
        })
      }
    </List>
}

export default Navigation
