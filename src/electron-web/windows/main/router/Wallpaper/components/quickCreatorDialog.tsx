import type { DialogProps } from '@mui/material'
import { Dialog } from '@mui/material'
import React from 'react'

interface Props extends DialogProps {
}

const QuickCreatorDialog: React.FC<Props> = ({ children, ...props }): JSX.Element => {
  return <Dialog {...props}>
    {children}
  </Dialog>
}

export default QuickCreatorDialog
