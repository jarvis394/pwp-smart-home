import { Controller } from '@nestjs/common'
import { DevicesService } from './devices.service'
import {
  AddDeviceReq,
  DeviceDeleteRes,
  FavoriteDeviceRes,
  ToggleDeviceOnOffRes,
} from '@smart-home/shared'
import { MessagePattern, Payload } from '@nestjs/microservices'

type DataWithUserID = {
  userId: string
}

@Controller()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @MessagePattern({ cmd: 'getDevices' })
  async getDevices(@Payload() data: DataWithUserID) {
    const devices = await this.devicesService.getDevices(data.userId)
    return { devices }
  }

  @MessagePattern({ cmd: 'getFavoriteDevices' })
  async getFavoriteDevices(@Payload() data: DataWithUserID) {
    const devices = await this.devicesService.getFavoriteDevices(data.userId)
    return { devices }
  }

  @MessagePattern({ cmd: 'toggleFavoriteDevice' })
  async toggleFavorite(
    @Payload()
    data: DataWithUserID & {
      deviceId: string
    }
  ): Promise<FavoriteDeviceRes> {
    const state = await this.devicesService.toggleFavorite(
      data.userId,
      data.deviceId
    )
    return { state }
  }

  @MessagePattern({ cmd: 'toggleOnOffDevice' })
  async toggleOnOff(
    @Payload()
    data: DataWithUserID & {
      deviceId: string
    }
  ): Promise<ToggleDeviceOnOffRes> {
    const state = await this.devicesService.toggleOnOff(
      data.userId,
      data.deviceId
    )
    return { state }
  }

  @MessagePattern({ cmd: 'deleteDevice' })
  async delete(
    @Payload()
    data: DataWithUserID & {
      deviceId: string
    }
  ): Promise<DeviceDeleteRes> {
    const state = await this.devicesService.delete(data.userId, data.deviceId)
    return { ok: state }
  }

  @MessagePattern({ cmd: 'addDevice' })
  async addDevice(
    @Payload()
    data: DataWithUserID & {
      data: AddDeviceReq
    }
  ) {
    const device = await this.devicesService.addDevice(data.userId, data.data)
    return { device }
  }
}
