import { MeetingRoom } from '@mui/icons-material'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MUIButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  styled,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import Button from 'src/components/Button'
import Input from 'src/components/Input'
import { PREDEFINED_ROOMS } from 'src/config/constants'
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useGetApartmentsQuery,
} from 'src/api'
import { useAppSelector } from 'src/store'
import type { ApiRoom } from '@smart-home/shared'
import { useSnackbar } from 'src/hooks/useSnackbar'

const RoomButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'flex-start',
  width: '100%',
}))

const SectionTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  fontWeight: 600,
  fontSize: 14,
  color: theme.palette.text.secondary,
  width: '100%',
  paddingTop: theme.spacing(1),
}))

type RoomSelectionModalProps = {
  open: boolean
  onClose: () => void
  existingRooms: ApiRoom[]
  selectedRoomId: string | null
  onConfirm: (roomId: string | null, newRoomName: string | null) => void
}

const RoomSelectionModal: React.FC<RoomSelectionModalProps> = ({
  open,
  onClose,
  existingRooms,
  selectedRoomId,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<string>(selectedRoomId || 'none')
  const [customName, setCustomName] = useState('')

  const existingRoomNames = useMemo(
    () => new Set(existingRooms.map((r) => r.name.toLowerCase())),
    [existingRooms]
  )

  const filteredPredefined = useMemo(
    () =>
      PREDEFINED_ROOMS.filter(
        (name) => !existingRoomNames.has(name.toLowerCase())
      ),
    [existingRoomNames]
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.value)
  }

  const handleConfirm = () => {
    if (selected === 'none') {
      onConfirm(null, null)
      return
    }

    const existingRoom = existingRooms.find((r) => r.id === selected)
    if (existingRoom) {
      onConfirm(existingRoom.id, null)
      return
    }

    const isPredefined = filteredPredefined.find((name) => name === selected)
    if (isPredefined) {
      onConfirm(null, isPredefined)
      return
    }

    if (selected === '__custom__' && customName.trim()) {
      onConfirm(null, customName.trim())
      return
    }

    onConfirm(null, null)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Choose a room</DialogTitle>
      <DialogContent>
        <RadioGroup value={selected} onChange={handleChange}>
          <SectionTitle>My rooms</SectionTitle>
          <FormControlLabel
            value="none"
            control={<Radio color="primaryVibrant" />}
            label="No room"
            sx={{ width: '100%', ml: 0, mr: 0 }}
          />
          {existingRooms.map((room) => (
            <FormControlLabel
              key={room.id}
              value={room.id}
              control={<Radio color="primaryVibrant" />}
              label={room.name}
              sx={{ width: '100%', ml: 0, mr: 0 }}
            />
          ))}
          {(filteredPredefined.length > 0 || true) && (
            <>
              <SectionTitle>Create new</SectionTitle>
              {filteredPredefined.map((name) => (
                <FormControlLabel
                  key={name}
                  value={name}
                  control={<Radio color="primaryVibrant" />}
                  label={name}
                  sx={{ width: '100%', ml: 0, mr: 0 }}
                />
              ))}
              <FormControlLabel
                value="__custom__"
                control={<Radio color="primaryVibrant" />}
                label=""
                sx={{ width: '100%', ml: 0, mr: 0, display: 'none' }}
              />
              <Input
                fullWidth
                disableUnderline
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value)
                  if (e.target.value) {
                    setSelected('__custom__')
                  }
                }}
                onFocus={() => {
                  if (customName) {
                    setSelected('__custom__')
                  }
                }}
                placeholder="Custom room name"
                sx={{ mt: 1 }}
              />
            </>
          )}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <MUIButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          Cancel
        </MUIButton>
        <MUIButton color="primaryVibrant" onClick={handleConfirm}>
          Choose
        </MUIButton>
      </DialogActions>
    </Dialog>
  )
}

type RoomSelectProps = {
  value: string | null
  onChange: (roomId: string | null) => void
}

const RoomSelect: React.FC<RoomSelectProps> = ({ value, onChange }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const { showSnackbar, SnackbarComponent } = useSnackbar()
  const { data: roomsData = [] } = useGetRoomsQuery({})
  const { data: apartments = [] } = useGetApartmentsQuery({})
  const [createRoom] = useCreateRoomMutation()
  const currentApartmentId = useAppSelector(
    (store) => store.apartment.currentApartmentId
  )

  const selectedRoomName = useMemo(() => {
    if (!value) return null
    return roomsData.find((r) => r.id === value)?.name || null
  }, [value, roomsData])

  const handleRoomConfirm = async (
    roomId: string | null,
    newRoomName: string | null
  ) => {
    if (roomId) {
      onChange(roomId)
    } else if (newRoomName) {
      const apartmentId = currentApartmentId || apartments[0]?.id
      if (!apartmentId) {
        setModalOpen(false)
        return
      }

      try {
        const newRoom = await createRoom({
          name: newRoomName,
          apartmentId,
        }).unwrap()
        onChange(newRoom.id)
      } catch (e) {
        const error = e as { data?: { message?: string }; message?: string }
        showSnackbar(
          error?.data?.message || error?.message || 'Failed to create room',
          'error'
        )
      }
    } else {
      onChange(null)
    }

    setModalOpen(false)
  }

  return (
    <>
      <RoomButton variant="default" onClick={() => setModalOpen(true)}>
        <MeetingRoom sx={{ fontSize: 20 }} />
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, fontSize: 15, flexGrow: 1, textAlign: 'left' }}
        >
          {selectedRoomName || 'Select room'}
        </Typography>
        {selectedRoomName && (
          <Typography variant="caption" color="text.secondary">
            Change
          </Typography>
        )}
      </RoomButton>
      <RoomSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existingRooms={roomsData}
        selectedRoomId={value}
        onConfirm={handleRoomConfirm}
      />
      {SnackbarComponent}
    </>
  )
}

export default RoomSelect
