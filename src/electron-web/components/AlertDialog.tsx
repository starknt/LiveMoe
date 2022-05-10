import React from 'react'
import Button from '@mui/material/Button'
import type { DialogProps } from '@mui/material/Dialog'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

interface Props extends DialogProps {
  title: string | React.ReactNode
  content: string | React.ReactNode
  onAccept?: () => void
  onCancel?: () => void
}

const AlertDialog: React.FC<Props> = ({ title, content, onAccept, onCancel, ...props }) => {
  return (
    <div>
      <Dialog
        {...props}
      >
        <DialogTitle>
          { title }
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            { content }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            if (onAccept)
              onAccept()
          }}>确认</Button>
          <Button onClick={() => {
            if (onCancel)
              onCancel()
          }} autoFocus>
            取消
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default AlertDialog
