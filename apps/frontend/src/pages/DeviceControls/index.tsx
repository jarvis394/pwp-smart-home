import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  styled,
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AppBarExtended } from 'src/components/AppBar'
import { DeviceCapabilityType, DeviceType } from '@smart-home/db/types'
import { getRouteByAlias } from 'src/utils/getRoutePath'
import ColorSetting from './ColorSetting'
import OnOff from './OnOff'
import {
  useToggleFavoriteDeviceMutation,
  useGetDevicesQuery,
  useDeleteDeviceMutation,
} from 'src/api'
import FullScreenSpinner from 'src/components/FullScreenSpinner'
import { DeleteOutlined, Favorite, FavoriteBorder } from '@mui/icons-material'

const Root = styled('div')(({ theme }) => ({
  padding: theme.spacing(1, 2),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  justifyContent: 'center',
  alignItems: 'center',
}))

type DeviceControlsPageParams = {
  id: string
}

type ConfirmDeleteModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this device?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }} autoFocus>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const DeviceControls: React.FC = () => {
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)
  const [favoriteToggle] = useToggleFavoriteDeviceMutation()
  const [deleteDevice] = useDeleteDeviceMutation()
  const navigate = useNavigate()
  const { id } = useParams<DeviceControlsPageParams>()
  const { data: devices, isSuccess } = useGetDevicesQuery({})
  const device = useMemo(() => {
    return devices?.devices.find((e) => e.id === id)
  }, [devices?.devices, id])
  const [isFavorite, setIsFavorite] = useState(device?.favorite || false)

  const supportsColorSettings =
    device &&
    device.type === DeviceType.LIGHT_BULB &&
    device.capabilities[DeviceCapabilityType.COLOR_SETTING]
  const supportsOnOff =
    device &&
    device.type !== DeviceType.CAMERA_OUTDOOR &&
    device.capabilities[DeviceCapabilityType.ON_OFF]

  const toggleFavoriteDevice = () => {
    if (!id) return

    const previousValue = isFavorite

    setIsFavorite((prev) => !prev)

    favoriteToggle({ id })
      .unwrap()
      .then((data) => {
        setIsFavorite(data.state)
      })
      .catch(() => {
        setIsFavorite(previousValue)
      })
  }

  const handleDeleteDevice = () => {
    if (!id) return

    deleteDevice({ id })
      .unwrap()
      .then((data) => {
        data.ok && navigate(getRouteByAlias('devices').path)
      })
  }

  const handleConfimDeleteModalOpen = () => {
    setConfirmDeleteModalOpen(true)
  }

  const handleConfimDeleteModalClose = () => {
    setConfirmDeleteModalOpen(false)
  }

  const handleConfimDelete = () => {
    handleDeleteDevice()
    handleConfimDeleteModalClose()
  }

  useEffect(() => {
    if (!device && isSuccess) {
      navigate(getRouteByAlias('devices').path)
    }
  }, [device, isSuccess, navigate])

  useEffect(() => {
    if (device && isSuccess) {
      setIsFavorite(device.favorite)
    }
  }, [device, isSuccess])

  if (!device) {
    return <FullScreenSpinner />
  }

  return (
    <>
      <AppBarExtended
        fixed
        toolbar={
          <>
            <IconButton onClick={handleConfimDeleteModalOpen}>
              <DeleteOutlined />
            </IconButton>
            <IconButton onClick={toggleFavoriteDevice}>
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </>
        }
        withBackButton
        header={device.name}
      />
      <Root>
        <ConfirmDeleteModal
          onClose={handleConfimDeleteModalClose}
          onConfirm={handleConfimDelete}
          open={isConfirmDeleteModalOpen}
        />
        {supportsColorSettings && <ColorSetting device={device} />}
        {supportsOnOff && <OnOff device={device} />}
      </Root>
    </>
  )
}

export default DeviceControls
