import type { Device } from '@smart-home/db'

export type DevicesGetRes = {
  devices: Device[]
}
export type DevicesGetReq = unknown

export type FavoriteDeviceRes = {
  state: boolean
}
export type FavoriteDeviceReq = { id: Device['id'] }

export type ToggleDeviceOnOffRes = {
  on: boolean
}
export type ToggleDeviceOnOffReq = { id: Device['id']; state: 'on' | 'off' }

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
