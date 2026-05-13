import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { DevicesService } from './devices.service'
import { Device } from '@smart-home/db/schema'
import {
  AddDeviceReq,
  DeviceDeleteRes,
  FavoriteDeviceRes,
} from '@smart-home/shared'

type DataWithUserID = {
  userId: string
}

@Controller()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @MessagePattern({ cmd: 'getDevices' })
  async getDevices(@Payload() data: DataWithUserID & { roomId?: string }) {
    const devices = await this.devicesService.getDevices(data.userId)
    return { devices }
  }

  @MessagePattern({ cmd: 'getFavoriteDevices' })
  async getFavoriteDevices(@Payload() data: DataWithUserID) {
    const devices = await this.devicesService.getFavoriteDevices(data.userId)
    return { devices }
  }

  @MessagePattern({ cmd: 'addDevice' })
  async addDevice(@Payload() data: DataWithUserID & { data: AddDeviceReq }) {
    const device = await this.devicesService.addDevice(data.userId, data.data)
    return { device }
  }

  @MessagePattern({ cmd: 'updateDevice' })
  async updateDevice(
    @Payload()
    data: DataWithUserID & { deviceId: string; data: Partial<Device> }
  ) {
    const device = await this.devicesService.updateDevice(
      data.userId,
      data.deviceId,
      data.data
    )
    return { device }
  }

  @MessagePattern({ cmd: 'deleteDevice' })
  async delete(
    @Payload() data: DataWithUserID & { deviceId: string }
  ): Promise<DeviceDeleteRes> {
    const state = await this.devicesService.delete(data.userId, data.deviceId)
    return { ok: state }
  }

  @MessagePattern({ cmd: 'toggleFavoriteDevice' })
  async toggleFavorite(
    @Payload() data: DataWithUserID & { deviceId: string }
  ): Promise<FavoriteDeviceRes> {
    const state = await this.devicesService.toggleFavorite(
      data.userId,
      data.deviceId
    )
    return { state }
  }

  @MessagePattern({ cmd: 'setDeviceState' })
  async setDeviceState(
    @Payload() data: DataWithUserID & { deviceId: string; on: boolean }
  ) {
    const state = await this.devicesService.setDeviceState(
      data.userId,
      data.deviceId,
      data.on
    )
    return { on: state }
  }
}
