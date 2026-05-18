import { Search } from '@mui/icons-material'
import {
  CircularProgress,
  Unstable_Grid2 as Grid,
  InputAdornment,
  styled,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import { useNavigate, generatePath } from 'react-router'
import AddDeviceAndAvatar from 'src/components/AddDeviceAndAvatar'
import { AppBar } from 'src/components/AppBar'
import DeviceCard, { DeviceCardClickHandler } from 'src/components/DeviceCard'
import Input from 'src/components/Input'
import { getRouteByAlias } from 'src/utils/getRoutePath'
import DevicesFilterTabs from './DevicesFilterTabs'
import { Device, DeviceType } from '@smart-home/db/types'
import { useDebounce } from 'src/hooks/useDebounce'
import { useGetDevicesQuery, useGetRoomsQuery } from 'src/api'
import FullScreenSpinner from 'src/components/FullScreenSpinner'
import NoDevicesIllustration from 'src/components/svg/NoDevicesIllustration'
import { PlaceholderRoot } from '../Favorites'
import { BUTTON_MAX_WIDTH } from 'src/config/constants'
import type { ApiRoom } from '@smart-home/shared'
import { useAppSelector } from 'src/store'

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}))

const SearchAndFiltersContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}))

const InputContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
}))

const SectionTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  fontWeight: 500,
  fontSize: 15,
  color: theme.palette.text.secondary,
  width: '100%',
  maxWidth: `calc(${BUTTON_MAX_WIDTH}px - ${theme.spacing(2)})`,
  padding: theme.spacing(2, 1, 1),
}))

const RoomSection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  '&:first-of-type > .SectionTitle': {
    paddingTop: theme.spacing(0),
  },
}))

const searchInString = (query: string, text: string) =>
  text.split(' ').some((s) => {
    return s.toLowerCase().startsWith(query.toLowerCase())
  })

const filterDevices: (props: {
  devices: Device[]
  query: string
  deviceTypes: Set<DeviceType>
}) => Device[] = ({ deviceTypes, devices, query }) => {
  const res: Device[] = []

  devices.forEach((device) => {
    const isInQuery = query ? searchInString(query, device.name) : true
    const isInDeviceTypes =
      deviceTypes.size > 0 ? deviceTypes.has(device.type) : true

    if (isInQuery && isInDeviceTypes) {
      res.push(device)
    }
  })

  return res
}

type RoomGroup = {
  roomId: string | null
  roomName: string | null
  devices: Device[]
}

const groupDevicesByRoom = (
  devices: Device[],
  rooms: ApiRoom[]
): RoomGroup[] => {
  const roomMap = new Map<string, ApiRoom>()
  rooms.forEach((room) => roomMap.set(room.id, room))

  const groups = new Map<string | null, Device[]>()

  // Ensure no room devices come first
  devices.forEach((device) => {
    const key = device.roomId || null
    const existing = groups.get(key)
    if (existing) {
      existing.push(device)
    } else {
      groups.set(key, [device])
    }
  })

  const result: RoomGroup[] = []

  // First add no room devices
  const noRoomDevices = groups.get(null)
  if (noRoomDevices && noRoomDevices.length > 0) {
    result.push({ roomId: null, roomName: null, devices: noRoomDevices })
  }

  // Then add devices attached to rooms
  groups.forEach((devs, key) => {
    if (key === null) return
    const room = roomMap.get(key)
    result.push({
      roomId: key,
      roomName: room?.name || 'Unknown room',
      devices: devs,
    })
  })

  return result
}

const Placeholder = () => (
  <PlaceholderRoot>
    <NoDevicesIllustration />
    <p>Add your devices or action cards here</p>
  </PlaceholderRoot>
)

const Devices: React.FC = () => {
  const navigate = useNavigate()
  const {
    data,
    isSuccess,
    isLoading: isDevicesLoading,
  } = useGetDevicesQuery({})
  const { data: roomsData = [], isLoading: isRoomsLoading } = useGetRoomsQuery(
    {}
  )
  const isLoading = isDevicesLoading || isRoomsLoading
  const devices = useMemo(
    () => (isSuccess ? data?.devices : []),
    [data?.devices, isSuccess]
  )
  const [query, setQuery] = useState('')
  const [activeFilterDeviceTypes, setActiveFilterDeviceTypes] = useState(
    new Set<DeviceType>()
  )
  const debouncedQuery = useDebounce(query, 200)
  const queryIsWaitingForDebounce = useMemo(
    () => query !== debouncedQuery,
    [debouncedQuery, query]
  )
  const filteredDevices = useMemo(
    () =>
      filterDevices({
        devices,
        query: debouncedQuery,
        deviceTypes: activeFilterDeviceTypes,
      }),
    [activeFilterDeviceTypes, devices, debouncedQuery]
  )

  const currentApartmentId = useAppSelector(
    (store) => store.apartment.currentApartmentId
  )

  // Filter rooms by current apartment
  const currentApartmentRooms = useMemo(() => {
    if (!currentApartmentId) return roomsData
    return roomsData.filter((r) => r.apartmentId === currentApartmentId)
  }, [roomsData, currentApartmentId])

  // Filter devices by current apartment
  const filteredDevicesByApartment = useMemo(() => {
    if (!currentApartmentId) return filteredDevices

    const currentRoomIds = new Set(currentApartmentRooms.map((r) => r.id))
    return filteredDevices.filter(
      (d) => !d.roomId || currentRoomIds.has(d.roomId)
    )
  }, [filteredDevices, currentApartmentRooms, currentApartmentId])

  const roomGroups = useMemo(
    () => groupDevicesByRoom(filteredDevicesByApartment, currentApartmentRooms),
    [filteredDevicesByApartment, currentApartmentRooms]
  )

  const appBar = useMemo(
    () => <AppBar fixed header="Devices" toolbar={<AddDeviceAndAvatar />} />,
    []
  )

  const handleDeviceCardClick: DeviceCardClickHandler = (_event, device) => {
    navigate(
      generatePath(getRouteByAlias('deviceControls').path, {
        id: device.id,
      })
    )
  }

  const handleFilterChange = (activeTabs: Set<DeviceType>) => {
    setActiveFilterDeviceTypes(new Set(activeTabs))
  }

  if (isSuccess && !isRoomsLoading && filteredDevicesByApartment.length === 0) {
    return (
      <>
        {appBar}
        <Placeholder />
      </>
    )
  }

  return (
    <>
      {appBar}
      <SearchAndFiltersContainer>
        <InputContainer>
          <Input
            disableUnderline
            type="search"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            placeholder="Search"
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            endAdornment={
              queryIsWaitingForDebounce && (
                <InputAdornment position="end">
                  <CircularProgress size={24} thickness={4} />
                </InputAdornment>
              )
            }
          />
        </InputContainer>
        <DevicesFilterTabs onChange={handleFilterChange} />
      </SearchAndFiltersContainer>
      {isLoading && <FullScreenSpinner />}
      {!isLoading && (
        <StyledGrid disableEqualOverflow spacing={1}>
          {roomGroups.map((group) => (
            <RoomSection key={group.roomId || '__no_room__'}>
              {group.roomName && (
                <SectionTitle className="SectionTitle">
                  {group.roomName}
                </SectionTitle>
              )}

              <Grid disableEqualOverflow container spacing={1}>
                {group.devices.map((device) => (
                  <Grid xs={6} md={4} lg={3} xl={2} key={device.id}>
                    <DeviceCard
                      onClick={handleDeviceCardClick}
                      device={device}
                    />
                  </Grid>
                ))}
              </Grid>
            </RoomSection>
          ))}
        </StyledGrid>
      )}
    </>
  )
}

export default Devices
