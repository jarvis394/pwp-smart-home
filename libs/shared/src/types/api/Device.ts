import { Device } from '../Device'

export type DevicesGetRes = {
  devices: Device[]
}
export type DevicesGetReq = unknown

export type FavoriteDeviceRes = {
  state: boolean
}
export type FavoriteDeviceReq = { id: Device['id'] }

export type ToggleDeviceOnOffRes = {
  state: boolean
}
export type ToggleDeviceOnOffReq = { id: Device['id'] }

export type DeviceDeleteRes = {
  ok: boolean
}
export type DeviceDeleteReq = { id: Device['id'] }

export type AddDeviceRes = { device: Device }
export type AddDeviceReq = Omit<Device, 'userId' | 'id' | 'favorite'>
