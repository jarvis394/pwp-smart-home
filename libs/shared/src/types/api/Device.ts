import type { Device } from '@smart-home/db'

export type DevicesGetRes = {
  devices: Device[]
}
export type DevicesGetReq = unknown

export type FavoriteDeviceRes = {
  state: boolean
}
export type FavoriteDeviceReq = { id: Device['id'] }

export type UpdateDeviceStateRes = Device
export type UpdateDeviceStateReq = {
  id: Device['id']
  body: {
    capabilities: Partial<Device['capabilities']>
  }
}

export type DeviceDeleteRes = {
  ok: boolean
}
export type DeviceDeleteReq = { id: Device['id'] }

export type AddDeviceRes = { device: Device }
export type AddDeviceReq = Omit<Device, 'userId' | 'id' | 'favorite'>

export type UpdateDeviceRes = Device
export type UpdateDeviceReq = {
  id: Device['id']
  body: Partial<Omit<Device, 'userId' | 'id'>>
}
