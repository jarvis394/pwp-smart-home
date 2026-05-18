import React, { useState, useMemo } from 'react'
import {
  styled,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button as MUIButton,
  TextField as MUITextField,
  Typography,
  alpha,
  CircularProgress,
} from '@mui/material'
import { ChevronRight, DeleteOutline, DevicesOther } from '@mui/icons-material'
import { AppBar } from 'src/components/AppBar'
import Button from 'src/components/Button'
import { BUTTON_MAX_WIDTH } from 'src/config/constants'
import { useSnackbar } from 'src/hooks/useSnackbar'
import {
  useGetApartmentQuery,
  useUpdateApartmentMutation,
  useDeleteApartmentMutation,
  useGetDevicesQuery,
  useGetApartmentsQuery,
  useGetRoomsQuery,
} from 'src/api'
import { useNavigate, useParams } from 'react-router'
import FullScreenSpinner from 'src/components/FullScreenSpinner'
import { useAppDispatch } from 'src/store'
import { setCurrentApartmentId } from 'src/store/apartment'

const Content = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  alignItems: 'center',
}))

const SectionTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  fontWeight: 500,
  fontSize: 15,
  color: theme.palette.text.secondary,
  width: '100%',
}))

const Section = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  alignItems: 'center',
  alignSelf: 'stretch',
}))

const ListItemButton = styled('button')(({ theme }) => ({
  ...theme.mixins.button,
  width: '100%',
  boxShadow: '0 0 0 2px inset ' + alpha(theme.palette.text.primary, 0.12),
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
  padding: theme.spacing(1.25, 1.5, 1.25, 2),
  color: theme.palette.text.primary,
}))

const ListItemContent = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  textAlign: 'left',
}))

const InfoItem = styled('div')(({ theme }) => ({
  width: '100%',
  boxShadow: '0 0 0 2px inset ' + alpha(theme.palette.text.primary, 0.12),
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
  padding: theme.spacing(1.25, 1.5, 1.25, 2),
  color: theme.palette.text.primary,
  maxWidth: BUTTON_MAX_WIDTH,
}))

const HomeSettings: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { showSnackbar, SnackbarComponent } = useSnackbar()
  const { data: apartment, isLoading: isApartmentLoading } =
    useGetApartmentQuery({ id }, { skip: !id })
  const { data: devicesData } = useGetDevicesQuery({})
  const { data: roomsData = [] } = useGetRoomsQuery({})
  const [updateApartment, { isLoading: isUpdating }] =
    useUpdateApartmentMutation()
  const [deleteApartment, { isLoading: isDeleting }] =
    useDeleteApartmentMutation()
  const { data: apartments = [] } = useGetApartmentsQuery({})

  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const $nameInput = React.useRef<HTMLInputElement>(null)
  const $addressInput = React.useRef<HTMLInputElement>(null)

  const deviceCount = useMemo(() => {
    if (!devicesData?.devices) return 0
    const currentRoomIds = new Set(
      roomsData.filter((r) => r.apartmentId === id).map((r) => r.id)
    )
    return devicesData.devices.filter(
      (d) => !d.roomId || currentRoomIds.has(d.roomId)
    ).length
  }, [devicesData?.devices, roomsData, id])

  const canDeleteHome = apartments.length > 1

  const handleUpdateName = () => {
    const value = $nameInput.current?.value?.trim()
    if (!value) return

    updateApartment({ id, body: { name: value } })
      .unwrap()
      .then(() => {
        showSnackbar('Home name updated', 'success')
        setNameDialogOpen(false)
      })
      .catch((error) => {
        showSnackbar(
          error?.data?.message || error?.message || 'Failed to update name',
          'error'
        )
      })
  }

  const handleUpdateAddress = () => {
    const value = $addressInput.current?.value?.trim()
    if (!value) return

    updateApartment({ id, body: { location: value } })
      .unwrap()
      .then(() => {
        showSnackbar('Home address updated', 'success')
        setAddressDialogOpen(false)
      })
      .catch((error) => {
        showSnackbar(
          error?.data?.message || error?.message || 'Failed to update address',
          'error'
        )
      })
  }

  const handleDelete = () => {
    if (!canDeleteHome) return
    const remaining = apartments.filter((apt) => apt.id !== id)
    deleteApartment({ id })
      .unwrap()
      .then(() => {
        showSnackbar('Home deleted', 'success')
        if (remaining.length > 0) {
          dispatch(setCurrentApartmentId(remaining[0]?.id || null))
        } else {
          dispatch(setCurrentApartmentId(null))
        }
        setDeleteDialogOpen(false)
        navigate(-1)
      })
      .catch((error) => {
        showSnackbar(
          error?.data?.message || error?.message || 'Failed to delete home',
          'error'
        )
        setDeleteDialogOpen(false)
      })
  }

  if (isApartmentLoading) {
    return (
      <>
        <AppBar fixed header="Home settings" withBackButton />
        <FullScreenSpinner />
      </>
    )
  }

  if (!apartment) {
    return (
      <>
        <AppBar fixed header="Home settings" withBackButton />
        <Content>
          <Typography color="text.secondary">Home not found</Typography>
        </Content>
      </>
    )
  }

  return (
    <>
      <AppBar fixed header="Home settings" withBackButton />
      <Content>
        <Section>
          <SectionTitle>Home info</SectionTitle>
          <ListItemButton onClick={() => setNameDialogOpen(true)}>
            <ListItemContent>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, fontSize: 15, lineHeight: '20px' }}
              >
                Home nickname
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: '16px' }}
              >
                {apartment.name}
              </Typography>
            </ListItemContent>
            <ChevronRight sx={{ color: 'text.secondary' }} />
          </ListItemButton>
          <ListItemButton onClick={() => setAddressDialogOpen(true)}>
            <ListItemContent>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, fontSize: 15, lineHeight: '20px' }}
              >
                Set address
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: '16px' }}
              >
                {apartment.location}
              </Typography>
            </ListItemContent>
            <ChevronRight sx={{ color: 'text.secondary' }} />
          </ListItemButton>
        </Section>

        <Section>
          <SectionTitle>Devices</SectionTitle>
          <InfoItem>
            <DevicesOther sx={{ color: 'text.secondary' }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, fontSize: 16, flexGrow: 1 }}
            >
              {deviceCount} {deviceCount === 1 ? 'device' : 'devices'}
            </Typography>
          </InfoItem>
        </Section>

        <Section>
          <SectionTitle>Danger zone</SectionTitle>
          <Button
            disabled={isDeleting || !canDeleteHome}
            variant="error"
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ gap: 1 }}
          >
            {isDeleting && <CircularProgress color="inherit" size={16} />}
            <DeleteOutline sx={{ fontSize: 20 }} />
            Delete this home
          </Button>
        </Section>
      </Content>

      {/* Edit name dialog */}
      <Dialog
        open={nameDialogOpen}
        onClose={() => setNameDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Home nickname</DialogTitle>
        <DialogContent>
          <MUITextField
            autoFocus
            fullWidth
            type="text"
            color="primaryVibrant"
            defaultValue={apartment.name}
            inputRef={$nameInput}
            placeholder="Home name"
          />
        </DialogContent>
        <DialogActions>
          <MUIButton
            onClick={() => setNameDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </MUIButton>
          <MUIButton
            color="primaryVibrant"
            disabled={isUpdating}
            onClick={handleUpdateName}
          >
            Save
          </MUIButton>
        </DialogActions>
      </Dialog>

      {/* Edit address dialog */}
      <Dialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Set address</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            This helps to give you accurate answers about local weather, traffic
            and more
          </DialogContentText>
          <MUITextField
            autoFocus
            fullWidth
            type="text"
            color="primaryVibrant"
            defaultValue={apartment.location}
            inputRef={$addressInput}
            placeholder="Address"
          />
        </DialogContent>
        <DialogActions>
          <MUIButton
            onClick={() => setAddressDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </MUIButton>
          <MUIButton
            color="primaryVibrant"
            disabled={isUpdating}
            onClick={handleUpdateAddress}
          >
            Save
          </MUIButton>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this home? All rooms and devices
            inside will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MUIButton
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
            autoFocus
          >
            Cancel
          </MUIButton>
          <MUIButton disabled={isDeleting} onClick={handleDelete} color="error">
            Delete
          </MUIButton>
        </DialogActions>
      </Dialog>
      {SnackbarComponent}
    </>
  )
}

export default HomeSettings
