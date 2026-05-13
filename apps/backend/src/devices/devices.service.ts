import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { Device } from '@smart-home/db/schema'
import { CreateDeviceDto } from './dto/create-device.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'

@Injectable()
export class DevicesService {
  constructor(
    @Inject('DEVICES_SERVICE') private readonly client: ClientProxy
  ) {}

  async getDevices(userId: string, roomId?: string): Promise<Device[]> {
    return await firstValueFrom(
      this.client.send({ cmd: 'getDevices' }, { userId, roomId })
    )
  }

  async getFavoriteDevices(userId: string): Promise<Device[]> {
    return await firstValueFrom(
      this.client.send({ cmd: 'getFavoriteDevices' }, { userId })
    )
  }

  async delete(userId: string, deviceId: string): Promise<boolean> {
    return await firstValueFrom(
      this.client.send({ cmd: 'deleteDevice' }, { userId, deviceId })
    )
  }

  async toggleFavorite(
    userId: string,
    deviceId: string
  ): Promise<{ favorite: boolean }> {
    const result: boolean = await firstValueFrom(
      this.client.send({ cmd: 'toggleFavoriteDevice' }, { userId, deviceId })
    )
    return { favorite: result }
  }

  async setState(
    userId: string,
    deviceId: string,
    on: boolean
  ): Promise<{ on: boolean }> {
    return await firstValueFrom(
      this.client.send({ cmd: 'setDeviceState' }, { userId, deviceId, on })
    )
  }

  async addDevice(userId: string, data: CreateDeviceDto): Promise<Device> {
    const result: Device = await firstValueFrom(
      this.client.send({ cmd: 'addDevice' }, { userId, data })
    )
    return result
  }

  async updateDevice(
    userId: string,
    deviceId: string,
    data: UpdateDeviceDto
  ): Promise<Device> {
    return firstValueFrom(
      this.client.send({ cmd: 'updateDevice' }, { userId, deviceId, data })
    )
  }
}
