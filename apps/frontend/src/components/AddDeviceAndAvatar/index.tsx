import React, { useState } from 'react'
import { Add, Close, Logout } from '@mui/icons-material'
import {
  IconButton,
  Box,
  Modal,
  Typography,
  styled,
  Fade,
  ButtonBase,
  CircularProgress,
} from '@mui/material'
import { getRouteByAlias } from 'src/utils/getRoutePath'
import { useNavigate } from 'react-router'
import { BUTTON_MAX_WIDTH } from 'src/config/constants'
import { APP_BAR_HEIGHT } from '../AppBar'
import { useAppDispatch, useAppSelector } from 'src/store'
import { FetchingState } from 'src/types/FetchingState'
import { logout } from 'src/store/auth'
import { useLogoutMutation } from 'src/api/index'
import UserAvatar from '../UserAvatar'
import { useSnackbar } from 'src/hooks/useSnackbar'

const ModalContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
}))

const ModalPage = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 28,
  width: '100%',
  maxWidth: BUTTON_MAX_WIDTH,
  display: 'flex',
  flexDirection: 'column',
}))

const ModalPageHeader = styled(Box)(() => ({
  width: '100%',
  fontSize: 22,
  lineHeight: '28px',
  fontWeight: 500,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: APP_BAR_HEIGHT,
}))

const ModalPageFooter = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.5),
  userSelect: 'none',
}))

const ModalPageFooterButton = styled(ButtonBase)(({ theme }) => ({
  padding: theme.spacing(1, 1.5),
  borderRadius: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  lineHeight: '16px',
}))

const ModalCloseIconButton = styled(IconButton)(({ theme }) => ({
  left: theme.spacing(1),
  top: theme.spacing(1),
  bottom: theme.spacing(1),
  position: 'absolute',
}))

const AccountBox = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  borderRadius: 22,
  padding: theme.spacing(1.5),
  margin: theme.spacing(1),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}))

const AccountInfo = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: '1',
}))

const Spinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

const AddDeviceAndAvatar: React.FC = () => {
  const navigate = useNavigate()
  const [logoutRequest, { isLoading: isLogoutLoading }] = useLogoutMutation()
  const [open, setOpen] = useState(false)
  const user = useAppSelector((store) => store.auth.user)
  const userFetchState = useAppSelector((store) => store.auth.state)
  const dispatch = useAppDispatch()
  const { showSnackbar, SnackbarComponent } = useSnackbar()

  const handleOpen = () => {
    if (userFetchState === FetchingState.FULFILLED) {
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleLogout = () => {
    logoutRequest()
      .unwrap()
      .then(() => {
        setOpen(false)
        dispatch(logout())
        showSnackbar('Logout successful', 'success')
        navigate(getRouteByAlias('login').path)
      })
      .catch((error) => {
        showSnackbar(
          error?.data?.message || error?.message || 'Logout failed',
          'error'
        )
      })
  }

  const goToAddDevice = () => {
    navigate(getRouteByAlias('addDevice').path)
  }

  return (
    <>
      <IconButton aria-label="Add device" onClick={goToAddDevice}>
        <Add />
      </IconButton>
      {userFetchState !== FetchingState.REJECTED && (
        <IconButton
          aria-label="Open user modal"
          aria-expanded={open}
          onClick={handleOpen}
          sx={{ padding: 0.5 }}
        >
          {userFetchState === FetchingState.PENDING && (
            <Box sx={{ display: 'flex' }} p={0.5}>
              <CircularProgress size={24} thickness={5} />
            </Box>
          )}
          {userFetchState === FetchingState.FULFILLED && (
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              firstName={user?.firstName}
            />
          )}
        </IconButton>
      )}
      <Modal open={open} onClose={handleClose} closeAfterTransition>
        <Fade in={open}>
          <ModalContainer>
            <ModalPage>
              <ModalPageHeader>
                <ModalCloseIconButton onClick={handleClose}>
                  <Close />
                </ModalCloseIconButton>
                Account
              </ModalPageHeader>
              <AccountBox>
                <UserAvatar
                  avatarUrl={user?.avatarUrl}
                  firstName={user?.firstName}
                />
                <AccountInfo>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, lineHeight: '18px', fontSize: 13 }}
                  >
                    {[user?.firstName, user?.lastName].join(' ').trim()}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ lineHeight: '15px' }}
                    color="text.secondary"
                  >
                    {user?.email}
                  </Typography>
                </AccountInfo>
                <IconButton disabled={isLogoutLoading} onClick={handleLogout}>
                  {!isLogoutLoading && <Logout />}
                  {isLogoutLoading && <Spinner size={24} />}
                </IconButton>
              </AccountBox>
              <ModalPageFooter>
                <ModalPageFooterButton>Privacy Policy</ModalPageFooterButton>•
                <ModalPageFooterButton>Terms of Use</ModalPageFooterButton>
              </ModalPageFooter>
            </ModalPage>
          </ModalContainer>
        </Fade>
      </Modal>
      {SnackbarComponent}
    </>
  )
}

export default AddDeviceAndAvatar
