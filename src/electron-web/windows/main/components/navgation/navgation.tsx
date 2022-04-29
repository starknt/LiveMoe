import { List, ListItemButton, ListItemText, Typography } from '@mui/material'
import { styled } from '@mui/system'
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState'
import useOnceEffect from 'electron-web/hooks/useOnceEffect'
import { Link, useNavigate } from 'react-router-dom'
import './navgation.css'

const NavTypography = styled(Typography)(() => ({
  fontSize: '1.1rem',
  fontWeight: 500,
}))

export interface INavgationItem {
  name: string
  to: string
}

export interface INavgationProps {
  items?: INavgationItem[]
}

const Navigation: React.FC<INavgationProps> = ({ items = [] }) => {
  const navigate = useNavigate()
  const [selectedIndex, setSelectedIndex] = useLocalStorageState('nav', 0, true)

  useOnceEffect(() => {
    if (typeof selectedIndex === 'number' && selectedIndex !== 0 && items[selectedIndex])
      navigate(items[selectedIndex].to)
  })

  return <List sx={{ display: 'flex', gap: '2rem' }} component="nav">
      {
        items.map((page, index) => {
          return <Link to={page.to} key={page.name}>
            <ListItemButton sx={{ padding: '0px 24px' }} selected={selectedIndex === index} onClick={() => setSelectedIndex(index)} className="non-draggable">
            <ListItemText>
              <NavTypography>{page.name}</NavTypography>
            </ListItemText>
            </ListItemButton>
          </Link>
        })
      }
    </List>
}

export default Navigation
