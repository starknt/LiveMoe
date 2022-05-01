import React from 'react'
import TextField from '@mui/material/TextField'
import type { DialogProps } from '@mui/material/Dialog'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface Props extends DialogProps {
  title: React.ReactNode | string
  content: React.ReactNode | string
}

const WallpaperConfigurationDialog: React.FC<Props> = ({ children, title, content, ...props }) => {
  return (
      <Dialog {...props} >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            { content }
          </DialogContentText>
        { children }
        </DialogContent>
      </Dialog>
  )
}

export default WallpaperConfigurationDialog
