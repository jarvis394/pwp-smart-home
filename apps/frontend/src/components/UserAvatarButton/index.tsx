import React, { useState } from 'react'
import {
  Close,
  Logout,
  SwapHoriz,
  Add,
  ChevronRight,
  HomeOutlined,
} from '@mui/icons-material'
import {
  IconButton,
  Box,
  Modal,
  Typography,
  styled,
  Fade,
  ButtonBase,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MUIButton,
  TextField as MUITextField,
} from '@mui/material'
import { getRouteByAlias } from 'src/utils/getRoutePath'
import { useNavigate, generatePath } from 'react-router'
import { BUTTON_MAX_WIDTH } from 'src/config/constants'
import { APP_BAR_HEIGHT } from '../AppBar'
import { useAppDispatch, useAppSelector } from 'src/store'
import { FetchingState } from 'src/types/FetchingState'
import { logout } from 'src/store/auth'
import {
  useLogoutMutation,
  useGetApartmentsQuery,
  useCreateApartmentMutation,
} from 'src/api/index'
import UserAvatar from '../UserAvatar'
import { useSnackbar } from 'src/hooks/useSnackbar'
import { setCurrentApartmentId } from 'src/store/apartment'

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
  padding: theme.spacing(0.5, 0.5, 1),
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

const ActionsList = styled(List)(({ theme }) => ({
  padding: theme.spacing(0, 1),
}))

const ActionsListItemButton = styled(ListItemButton)(() => ({
  borderRadius: 16,
}))

const UserAvatarButton: React.FC = () => {
  const navigate = useNavigate()
  const [logoutRequest, { isLoading: isLogoutLoading }] = useLogoutMutation()
  const [open, setOpen] = useState(false)
  const [switchHomesOpen, setSwitchHomesOpen] = useState(false)
  const [createHomeOpen, setCreateHomeOpen] = useState(false)
  const user = useAppSelector((store) => store.auth.user)
  const userFetchState = useAppSelector((store) => store.auth.state)
  const currentApartmentId = useAppSelector(
    (store) => store.apartment.currentApartmentId
  )
  const dispatch = useAppDispatch()
  const { showSnackbar, SnackbarComponent } = useSnackbar()

  const { data: apartments = [] } = useGetApartmentsQuery(
    {},
    { skip: userFetchState !== FetchingState.FULFILLED }
  )
  const [createApartment] = useCreateApartmentMutation()

  const $nameInput = React.useRef<HTMLInputElement>(null)
  const $locationInput = React.useRef<HTMLInputElement>(null)

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

  const handleSwitchHomesOpen = () => {
    setOpen(false)
    setSwitchHomesOpen(true)
  }

  const handleSwitchHomesClose = () => {
    setSwitchHomesOpen(false)
  }

  const handleSelectApartment = (apartmentId: string) => {
    dispatch(setCurrentApartmentId(apartmentId))
    setSwitchHomesOpen(false)
    showSnackbar('Home switched', 'success')
  }

  const handleHomeSettings = () => {
    if (currentApartmentId) {
      setOpen(false)
      navigate(
        generatePath(getRouteByAlias('homeSettings').path, {
          id: currentApartmentId,
        })
      )
    } else if (apartments.length > 0) {
      setOpen(false)
      navigate(
        generatePath(getRouteByAlias('homeSettings').path, {
          id: apartments[0]?.id,
        })
      )
    } else {
      showSnackbar('No home to configure', 'info')
    }
  }

  const handleCreateHomeOpen = () => {
    setCreateHomeOpen(true)
  }

  const handleCreateHomeClose = () => {
    setCreateHomeOpen(false)
  }

  const handleCreateHome = () => {
    const name = $nameInput.current?.value?.trim()
    const location = $locationInput.current?.value?.trim()

    if (!name || !location) {
      showSnackbar('Please fill in all fields', 'error')
      return
    }

    createApartment({ name, location })
      .unwrap()
      .then((newApartment) => {
        dispatch(setCurrentApartmentId(newApartment.id))
        setCreateHomeOpen(false)
        setSwitchHomesOpen(false)
        showSnackbar('Home created', 'success')
      })
      .catch((error) => {
        showSnackbar(
          error?.data?.message || error?.message || 'Failed to create home',
          'error'
        )
      })
  }

  return (
    <>
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

      {/* Account modal */}
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
              <ActionsList disablePadding>
                <ListItem disablePadding>
                  <ActionsListItemButton onClick={handleHomeSettings}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <HomeOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Home settings" />
                    <ChevronRight sx={{ color: 'text.secondary' }} />
                  </ActionsListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ActionsListItemButton onClick={handleSwitchHomesOpen}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <SwapHoriz />
                    </ListItemIcon>
                    <ListItemText primary="Switch homes" />
                    <ChevronRight sx={{ color: 'text.secondary' }} />
                  </ActionsListItemButton>
                </ListItem>
              </ActionsList>
              <ModalPageFooter>
                <ModalPageFooterButton>Privacy Policy</ModalPageFooterButton>•
                <ModalPageFooterButton>Terms of Use</ModalPageFooterButton>
              </ModalPageFooter>
            </ModalPage>
          </ModalContainer>
        </Fade>
      </Modal>

      {/* Switch homes modal */}
      <Modal
        open={switchHomesOpen}
        onClose={handleSwitchHomesClose}
        closeAfterTransition
      >
        <Fade in={switchHomesOpen}>
          <ModalContainer>
            <ModalPage>
              <ModalPageHeader>
                <ModalCloseIconButton onClick={handleSwitchHomesClose}>
                  <Close />
                </ModalCloseIconButton>
                Switch homes
              </ModalPageHeader>
              <List sx={{ px: 1, pb: 1 }}>
                {apartments.map((apartment) => (
                  <ListItem key={apartment.id} disablePadding>
                    <ListItemButton
                      selected={apartment.id === currentApartmentId}
                      onClick={() => handleSelectApartment(apartment.id)}
                      sx={{ borderRadius: 4 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <HomeOutlined />
                      </ListItemIcon>
                      <ListItemText
                        primary={apartment.name}
                        secondary={apartment.location}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                {apartments.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No homes yet"
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleCreateHomeOpen}
                    sx={{ borderRadius: 4 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Add />
                    </ListItemIcon>
                    <ListItemText primary="Create new home" />
                  </ListItemButton>
                </ListItem>
              </List>
            </ModalPage>
          </ModalContainer>
        </Fade>
      </Modal>

      {/* Create home dialog */}
      <Dialog
        open={createHomeOpen}
        onClose={handleCreateHomeClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create new home</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <MUITextField
            autoFocus
            fullWidth
            type="text"
            color="primaryVibrant"
            defaultValue=""
            inputRef={$nameInput}
            placeholder="Home name"
            label="Name"
            variant="outlined"
            sx={{ mt: 1 }}
          />
          <MUITextField
            fullWidth
            type="text"
            color="primaryVibrant"
            defaultValue=""
            inputRef={$locationInput}
            placeholder="City or address"
            label="Location"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <MUIButton
            onClick={handleCreateHomeClose}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </MUIButton>
          <MUIButton color="primaryVibrant" onClick={handleCreateHome}>
            Create
          </MUIButton>
        </DialogActions>
      </Dialog>

      {SnackbarComponent}
    </>
  )
}

export default UserAvatarButton
