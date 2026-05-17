import React, { useState } from 'react'
import { Snackbar, Alert, AlertColor } from '@mui/material'
import { BOTTOM_NAVIGATION_HEIGHT } from 'src/components/BottomNavigation'

export const useSnackbar = () => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<AlertColor>('info')

  const showSnackbar = (msg: string, sev: AlertColor = 'info') => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const SnackbarComponent = (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ bottom: BOTTOM_NAVIGATION_HEIGHT + 8 }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )

  return { showSnackbar, SnackbarComponent }
}
