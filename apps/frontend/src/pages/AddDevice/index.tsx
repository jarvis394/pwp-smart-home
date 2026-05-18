import { QrCodeScanner } from '@mui/icons-material'
import { Unstable_Grid2 as Grid, styled } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { AppBarExtended } from 'src/components/AppBar'
import Button from 'src/components/Button'
import { getDeviceIcon } from 'src/components/DeviceCard'
import AddDeviceIllustration from 'src/components/svg/AddDeviceIllustration'
import { BUTTON_MAX_WIDTH } from 'src/config/constants'
import { exhaustivnessCheck } from '@smart-home/shared'
import Input from 'src/components/Input'
import RoomSelect from 'src/components/RoomSelect'
import { useAddDeviceMutation } from 'src/api'
import { useNavigate } from 'react-router-dom'
import { getRouteByAlias } from 'src/utils/getRoutePath'
import {
  DeviceState,
  DeviceType as DeviceTypeWithBasicDevice,
} from '@smart-home/db/types'
import { devices } from '@smart-home/db/mock/devices'

type DeviceType = Exclude<
  DeviceTypeWithBasicDevice,
  DeviceTypeWithBasicDevice.BASIC_DEVICE
>

const Content = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  alignItems: 'center',
}))

const ScanQRButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}))

const Illustration = styled(AddDeviceIllustration)({
  width: '100%',
  height: 'auto',
  maxWidth: BUTTON_MAX_WIDTH,
})

const DeviceCard = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}))

const DeviceCardIcon = styled('div')(({ theme }) => ({
  color: theme.palette.primary.dark,
}))

type DeviceItem = {
  type: DeviceType
  label: string
}
const DEVICES: DeviceItem[] = [
  {
    type: DeviceTypeWithBasicDevice.CAMERA_OUTDOOR,
    label: 'Outdoor camera',
  },
  {
    type: DeviceTypeWithBasicDevice.KETTLE,
    label: 'Kettle',
  },
  {
    type: DeviceTypeWithBasicDevice.LIGHT_BULB,
    label: 'Light bulb',
  },
  {
    type: DeviceTypeWithBasicDevice.THERMOSTAT,
    label: 'Thermostat',
  },
]

enum Step {
  CHOOSE_DEVICE_TYPE,
  DEVICE_DETAILS,
}

type StepPageProps = {
  setStep: React.Dispatch<React.SetStateAction<Step>>
}

type ChooseDeviceType = StepPageProps & {
  setNewDeviceType: React.Dispatch<React.SetStateAction<DeviceType | null>>
}

const ChooseDeviceType: React.FC<ChooseDeviceType> = ({
  setStep,
  setNewDeviceType,
}) => {
  const handleAddDeviceClick = (type: DeviceType) => {
    setStep(Step.DEVICE_DETAILS)
    setNewDeviceType(type)
  }

  return (
    <>
      <AppBarExtended fixed withBackButton header="Add a device" />
      <Content>
        <Illustration />
        <ScanQRButton variant="primaryTransparent">
          <QrCodeScanner />
          Scan QR
        </ScanQRButton>
        <Grid disableEqualOverflow container spacing={1}>
          {DEVICES.map((device) => {
            const Icon = getDeviceIcon(device.type)

            return (
              <Grid xs={6} md={4} lg={3} xl={2} key={device.type}>
                <DeviceCard
                  onClick={handleAddDeviceClick.bind(null, device.type)}
                  variant="default"
                >
                  <DeviceCardIcon>
                    <Icon />
                  </DeviceCardIcon>
                  {device.label}
                </DeviceCard>
              </Grid>
            )
          })}
        </Grid>
      </Content>
    </>
  )
}

type DeviceDetailsProps = StepPageProps & {
  newDeviceType: DeviceType | null
}
const DeviceDetails: React.FC<DeviceDetailsProps> = ({ newDeviceType }) => {
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const navigate = useNavigate()
  const [addDevice] = useAddDeviceMutation()
  const headerTitle = useMemo(
    () => DEVICES.find((e) => e.type === newDeviceType)?.label,
    [newDeviceType]
  )

  const onSubmit = () => {
    const mockCapabilities = devices.find(
      (e) => e.type === newDeviceType
    )?.capabilities

    if (name === '') return
    if (!newDeviceType || !mockCapabilities) return

    addDevice({
      name,
      model,
      type: newDeviceType,
      state: DeviceState.ONLINE,
      capabilities: mockCapabilities,
      roomId: selectedRoomId ?? undefined,
    }).then(() => {
      navigate(getRouteByAlias('devices').path)
    })
  }

  return (
    <>
      <AppBarExtended fixed withBackButton header={headerTitle} />
      <Content>
        <Input
          fullWidth
          disableUnderline
          type="text"
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder="Device name"
        />
        <Input
          fullWidth
          disableUnderline
          type="text"
          onChange={(e) => setModel(e.target.value)}
          value={model}
          placeholder="Device model"
        />
        <RoomSelect value={selectedRoomId} onChange={setSelectedRoomId} />
        <Button onClick={onSubmit}>Add new</Button>
      </Content>
    </>
  )
}

const AddDevice: React.FC = () => {
  const [step, setStep] = useState(Step.CHOOSE_DEVICE_TYPE)
  const [newDeviceType, setNewDeviceType] = useState<DeviceType | null>(null)

  switch (step) {
    case Step.CHOOSE_DEVICE_TYPE:
      return (
        <ChooseDeviceType
          setStep={setStep}
          setNewDeviceType={setNewDeviceType}
        />
      )
    case Step.DEVICE_DETAILS:
      return <DeviceDetails setStep={setStep} newDeviceType={newDeviceType} />
    default:
      return exhaustivnessCheck(step)
  }
}

export default AddDevice
