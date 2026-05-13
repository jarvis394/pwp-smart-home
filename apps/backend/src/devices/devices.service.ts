import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { Device } from '@smart-home/db/schema'
import { CreateDeviceDto } from './dto/create-device.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'

// Service for managing user devices, communicating with a microservice for device
// operations, and handling business logic related to devices
@Injectable()
export class DevicesService {
  constructor(
    @Inject('DEVICES_SERVICE') private readonly client: ClientProxy
  ) {}

  // Method to retrieve devices for a user, optionally filtered by room, by sending
  // a message to the devices microservice and awaiting the response
  async getDevices(userId: string, roomId?: string): Promise<Device[]> {
    return await firstValueFrom(
      this.client.send({ cmd: 'getDevices' }, { userId, roomId })
    )
  }

  // Method to retrieve a single device by its ID for a user, throwing an error if
  // the device is not found
  async getFavoriteDevices(userId: string): Promise<Device[]> {
    return await firstValueFrom(
      this.client.send({ cmd: 'getFavoriteDevices' }, { userId })
    )
  }

  // Method to delete a device by its ID for a user, sending a message to the devices
  // microservice and awaiting the response, and throwing an error if the device is
  // not found
  async delete(userId: string, deviceId: string): Promise<boolean> {
    return await firstValueFrom(
      this.client.send({ cmd: 'deleteDevice' }, { userId, deviceId })
    )
  }

  // Method to toggle the favorite status of a device for a user, sending a message
  // to the devices microservice and awaiting the response, and throwing an error if
  // the device is not found
  async toggleFavorite(
    userId: string,
    deviceId: string
  ): Promise<{ favorite: boolean }> {
    const result: boolean = await firstValueFrom(
      this.client.send({ cmd: 'toggleFavoriteDevice' }, { userId, deviceId })
    )
    return { favorite: result }
  }

  // Method to set the power state of a device (on/off) for a user, sending a message
  // to the devices microservice and awaiting the response, and throwing an error
  // if the device is not found
  async setState(
    userId: string,
    deviceId: string,
    on: boolean
  ): Promise<{ on: boolean }> {
    return await firstValueFrom(
      this.client.send({ cmd: 'setDeviceState' }, { userId, deviceId, on })
    )
  }

  // Method to add a new device for a user, sending a message to the devices microservice
  // with the device data and awaiting the response, and throwing an error if the
  // creation fails
  async addDevice(userId: string, data: CreateDeviceDto): Promise<Device> {
    const result: Device = await firstValueFrom(
      this.client.send({ cmd: 'addDevice' }, { userId, data })
    )
    return result
  }

  // Method to update an existing device for a user, sending a message to the
  // devices microservice with the updated data and awaiting the response, and
  // throwing an error if the device is not found
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
