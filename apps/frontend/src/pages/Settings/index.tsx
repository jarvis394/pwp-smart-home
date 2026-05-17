import { AttachFileOutlined } from '@mui/icons-material'
import {
  CircularProgress,
  alpha,
  styled,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button as MUIButton,
} from '@mui/material'
import React, { useRef, useState } from 'react'
import { useSnackbar } from 'src/hooks/useSnackbar'
import {
  useUpdateUserMutation,
  useUploadUserAvatarMutation,
  useDeleteUserMutation,
} from 'src/api/index'
import { AppBar } from 'src/components/AppBar'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import Switch from 'src/components/Switch'
import UserAvatar from 'src/components/UserAvatar'
import { BUTTON_MAX_WIDTH } from 'src/config/constants'
import { useAppDispatch, useAppSelector } from 'src/store'
import { setTheme } from 'src/store/app'
import { setUser } from 'src/store/auth'
import { Theme } from 'src/types/Theme'

export const ACCEPTED_IMAGE_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const Content = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  alignItems: 'center',
}))

const SectionTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  fontWeight: 600,
  fontSize: 15,
  color: theme.palette.text.secondary,
  width: '100%',
  maxWidth: `calc(${BUTTON_MAX_WIDTH}px - ${theme.spacing(2)})`,
}))

const Section = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  alignItems: 'center',
  alignSelf: 'stretch',
}))

const OnOffButton = styled('label')(({ theme }) => ({
  padding: theme.spacing(1.25, 2),
  paddingRight: theme.spacing(1.25),
  borderRadius: 100,
  boxShadow: '0 0 0 2px inset ' + alpha(theme.palette.text.primary, 0.12),
  fontFamily: theme.typography.fontFamily,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: '20px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  ...theme.mixins.button,
  '&:active': {
    transform: 'none',
  },
}))

const UploadButtonRoot = styled('button')(({ theme }) => ({
  ...theme.mixins.button,
  width: '100%',
  boxShadow: '0 0 0 2px inset ' + theme.palette.background.default,
  background: 'transparent',
  borderRadius: '100px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  height: 52,
  fontFamily: theme.typography.fontFamily,
  fontSize: 15,
  fontWeight: 500,
  padding: theme.spacing(1.25, 2),
  paddingRight: theme.spacing(1.25),
  color: theme.palette.text.primary,
}))

const UploadAvatar: React.FC = () => {
  const $fileInput = useRef<HTMLInputElement>(null)
  const user = useAppSelector((store) => store.auth.user)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [uploadUserAvatar, { isLoading }] = useUploadUserAvatarMutation()

  const { showSnackbar, SnackbarComponent } = useSnackbar()

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!$fileInput.current) return

    const uploadedFile = e.target.files?.[0]

    if (!uploadedFile) return
    if (!ACCEPTED_IMAGE_FILE_TYPES.some((e) => e === uploadedFile.type)) {
      showSnackbar('Invalid file type', 'error')
      return
    }

    const newAvatar = new FormData()
    newAvatar.append('file', uploadedFile)
    newAvatar.append('type', uploadedFile.type)
    newAvatar.append('title', uploadedFile.name)
    uploadUserAvatar(newAvatar)
      .unwrap()
      .then((data) => {
        setAvatarUrl(data.avatarUrl)
        showSnackbar('Avatar updated successfully', 'success')
      })
      .catch((error) => {
        showSnackbar(
          error?.data?.message || error?.message || 'Failed to update avatar',
          'error'
        )
      })

    $fileInput.current.value = ''
  }

  const handleClick = () => {
    $fileInput.current?.click()
  }

  return (
    <UploadButtonRoot onClick={handleClick}>
      <input
        placeholder="Select file"
        type="file"
        name="avatar"
        multiple={false}
        onChange={handleChange}
        style={{ display: 'none' }}
        ref={$fileInput}
      />
      {!isLoading && (
        <UserAvatar avatarUrl={avatarUrl} firstName={user?.firstName} />
      )}
      {isLoading && <CircularProgress color="inherit" size={32} />}
      <AttachFileOutlined />
      Upload avatar
      {SnackbarComponent}
    </UploadButtonRoot>
  )
}

const Settings: React.FC = () => {
  const theme = useAppSelector((store) => store.app.theme)
  const user = useAppSelector((store) => store.auth.user)
  const dispatch = useAppDispatch()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [updateUser, { isLoading }] = useUpdateUserMutation()

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()
  const { showSnackbar, SnackbarComponent } = useSnackbar()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDarkThemeSwitchChange = () => {
    dispatch(setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT))
  }

  const handleUpdateUserClick = () => {
    updateUser({ firstName, lastName })
      .unwrap()
      .then((data) => {
        dispatch(setUser(data.user))
        showSnackbar('Profile updated successfully', 'success')
      })
      .catch((error) => {
        showSnackbar(
          error?.data?.message || error?.message || 'Failed to update profile',
          'error'
        )
      })
  }

  const handleDeleteUserClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    deleteUser({})
      .unwrap()
      .then(() => {
        showSnackbar('Account deleted', 'success')
        setDeleteDialogOpen(false)
      })
      .catch((error) => {
        showSnackbar(
          error?.data?.message || error?.message || 'Failed to delete account',
          'error'
        )
        setDeleteDialogOpen(false)
      })
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <AppBar fixed header="Settings" />
      <Content>
        <OnOffButton>
          Dark theme
          <Switch
            onChange={handleDarkThemeSwitchChange}
            checked={theme === Theme.DARK}
            id="dark-theme-switch"
          />
        </OnOffButton>
        <Section>
          <SectionTitle>Account</SectionTitle>
          <UploadAvatar />
          <Input
            fullWidth
            disableUnderline
            value={firstName}
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            fullWidth
            disableUnderline
            value={lastName}
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            onChange={(e) => setLastName(e.target.value)}
          />
          <Button
            disabled={isLoading}
            sx={{ gap: 1 }}
            onClick={handleUpdateUserClick}
          >
            {isLoading && <CircularProgress color="inherit" size={16} />}
            Save
          </Button>
          <Button
            disabled={isDeleting}
            variant="error"
            onClick={handleDeleteUserClick}
          >
            {isDeleting && <CircularProgress color="inherit" size={16} />}
            Delete account
          </Button>
        </Section>
      </Content>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MUIButton
            onClick={handleCloseDeleteDialog}
            sx={{ color: 'text.secondary' }}
            autoFocus
          >
            Cancel
          </MUIButton>
          <MUIButton
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            color="error"
          >
            Delete
          </MUIButton>
        </DialogActions>
      </Dialog>
      {SnackbarComponent}
    </>
  )
}

export default Settings
