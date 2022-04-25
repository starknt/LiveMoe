/**
 * 壁纸分类...
 */

import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import useLocalStorageState from 'electron-web/hooks/useLocalStorageState'
import { useCallback, useState } from 'react'

type FilterType = 'all' | 'html' | 'video'
interface IFilter {
  name: string
  type: FilterType
}

const supportedFilterType: IFilter[] = [
  {
    name: '全部壁纸',
    type: 'all',
  },
  {
    name: '互动壁纸',
    type: 'html',
  },
  {
    name: '视频壁纸',
    type: 'video',
  },
]

const WallpaperController: React.FC<{}> = () => {
  const [filterType, setFilterType] = useLocalStorageState<FilterType>('filterType', 'all')
  const [selectedIndex, setSelectedIndex] = useState(() => supportedFilterType.findIndex(item => item.type === filterType))

  const handleFilter = useCallback((index: number, type: FilterType) => {
    return () => {
      setSelectedIndex(index)
      setFilterType(type)
    }
  }, [])

  return <Box sx={{ display: 'flex', padding: '4px 8px' }}>
      <List sx={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
       <ListItemText>壁纸分类: </ListItemText>
        {
          supportedFilterType.map((filterType, index) => {
            return <ListItemButton key={filterType.name} onClick={handleFilter(index, filterType.type)} selected={selectedIndex === index} sx={{ padding: '0px 12px' }}>
              <ListItemText>{ filterType.name }</ListItemText>
            </ListItemButton>
          })
        }
      </List>
  </Box>
}

export default WallpaperController
