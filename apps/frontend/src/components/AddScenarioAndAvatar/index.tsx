import React, { useState } from 'react'
import { Add } from '@mui/icons-material'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MUIButton,
  TextField as MUITextField,
  IconButton,
} from '@mui/material'
import UserAvatarButton from '../UserAvatarButton'
import { useCreateScenarioMutation } from 'src/api'

type CreateScenarioModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (name: string) => void
}

const CreateScenarioModal: React.FC<CreateScenarioModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const $input = React.useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const value = $input.current?.value?.trim()
    if (!value) return

    onSubmit(value)
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>New scenario</DialogTitle>
      <DialogContent>
        <MUITextField
          autoFocus
          fullWidth
          type="text"
          color="primaryVibrant"
          defaultValue=""
          inputRef={$input}
          placeholder="Scenario name"
        />
      </DialogContent>
      <DialogActions>
        <MUIButton onClick={handleClose} sx={{ color: 'text.secondary' }}>
          Cancel
        </MUIButton>
        <MUIButton color="primaryVibrant" onClick={handleSubmit}>
          Create
        </MUIButton>
      </DialogActions>
    </Dialog>
  )
}

const AddScenarioAndAvatar: React.FC = () => {
  const [createScenario] = useCreateScenarioMutation()
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)

  const handleCreateScenario = (name: string) => {
    createScenario({ name, actions: [] })
  }

  return (
    <>
      <IconButton
        aria-label="Add scenario"
        onClick={() => setCreateModalOpen(true)}
      >
        <Add />
      </IconButton>
      <UserAvatarButton />
      <CreateScenarioModal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateScenario}
      />
    </>
  )
}

export default AddScenarioAndAvatar
