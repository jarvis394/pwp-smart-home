import { Inject, Injectable } from '@nestjs/common'
import { AddDeviceReq } from '@smart-home/shared'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { Device } from '@smart-home/db/schema'

@Injectable()
export class DevicesService {
  constructor(
    @Inject('DEVICES_SERVICE') private readonly client: ClientProxy
  ) {}

  async getDevices(userId: string): Promise<Device[]> {
    return await firstValueFrom(
      this.client.send({ cmd: 'getDevices' }, { userId })
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

  async toggleFavorite(userId: string, deviceId: string): Promise<boolean> {
    return await firstValueFrom(
      this.client.send({ cmd: 'toggleFavoriteDevice' }, { userId, deviceId })
    )
  }

  async toggleOnOff(userId: string, deviceId: string): Promise<boolean> {
    return await firstValueFrom(
      this.client.send({ cmd: 'toggleOnOffDevice' }, { userId, deviceId })
    )
  }

  async addDevice(userId: string, data: AddDeviceReq): Promise<Device> {
    const result: Device = await firstValueFrom(
      this.client.send(
        { cmd: 'addDevice' },
        {
          userId,
          data,
        }
      )
    )

    return result
  }
}
