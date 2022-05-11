import Box, { type BoxProps } from '@mui/material/Box'
import useMemoizedFn from 'electron-web/hooks/useMemoizedFn'
import React from 'react'

const SettingBox: React.FC<BoxProps> = ({ children, ...props }) => {
  const childrenCount = React.Children.count(children)

  const renderTwoElementInLine = useMemoizedFn(
    (
      childrens: (React.ReactChild | React.ReactFragment | React.ReactPortal)[],
    ): any => {
      if (childrens.length <= 0)
        return ''

      const ElementInLine = childrens.splice(0, 2)

      return (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '2rem',
            }}
          >
            {ElementInLine.map((child) => {
              return child
            })}
          </Box>
          {childrens.length > 0 ? renderTwoElementInLine(childrens) : ''}
        </>
      )
    },
  )

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: childrenCount > 2 ? 'flex-start' : 'center',
        flexWrap: 'wrap',
        flexDirection: childrenCount > 2 ? 'column' : 'row',
      }}
      {...props}
    >
      {childrenCount >= 2
        ? renderTwoElementInLine(React.Children.toArray(children))
        : children}
    </Box>
  )
}

export default SettingBox
