/**
 * @file Services for handling Device resources
 * In charge of handling security rules regarding ownership
 * Uses a microservice client (DEVICES_SERVICE) to handle device CRUD operations
 */
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

  /**
   * Gets a list of devices
   * @async
   * @param {string} userId - UUID credentials of the devices owner
   * @returns {Promise<Device[]>} - Array objects of devices
   */
  async getDevices(userId: string, roomId?: string): Promise<Device[]> {
    return await firstValueFrom(
      this.client.send({ cmd: 'getDevices' }, { userId, roomId })
    )
  }

  /**
   * Gets a list of favorite devices
   * @async
   * @param {string} userId - UUID credentials of the devices owner
   * @returns {Promise<Device[]>} - Array objects of devices
   */
  async getFavoriteDevices(userId: string): Promise<Device[]> {
    return await firstValueFrom(
      this.client.send({ cmd: 'getFavoriteDevices' }, { userId })
    )
  }

  /**
   * Deletes device details
   * @async
   * @param {string} userId - UUID credentials of the device owner
   * @param {string} deviceId - single UUID for device
   * @returns {Promise<boolean>} - True if deleted
   */
  async delete(userId: string, deviceId: string): Promise<boolean> {
    return await firstValueFrom(
      this.client.send({ cmd: 'deleteDevice' }, { userId, deviceId })
    )
  }

  /**
   * Sets a singular state as favorite
   * @async
   * @param {string} userId - UUID credentials of the devices owner
   * @param {string} deviceId - single UUID for device
   * @returns {Promise<Device>} - Device object status
   */
  async toggleFavorite(
    userId: string,
    deviceId: string
  ): Promise<{ favorite: boolean }> {
    const { state } = await firstValueFrom(
      this.client.send({ cmd: 'toggleFavoriteDevice' }, { userId, deviceId })
    )
    return { favorite: state }
  }

  /**
   * Sets an device state on or off
   * @async
   * @param {string} userId - UUID credentials of the devices owner
   * @param {string} deviceId - single UUID for device
   * @param {string} on - Fetches if status is active
   * @returns {Promise<{ on: boolean }>} - Confirmation if device status was set
   */
  async setState(
    userId: string,
    deviceId: string,
    on: boolean
  ): Promise<{ on: boolean }> {
    return await firstValueFrom(
      this.client.send({ cmd: 'setDeviceState' }, { userId, deviceId, on })
    )
  }

  /**
   * Creates a device after verifying ownership
   * @async
   * @param {string} userId - UUID credentials of the device owner
   * @param {CreateDeviceDTO} data - DTO obhject to be updated
   * @returns {Promise<Device>} - Created device object
   */
  async addDevice(userId: string, data: CreateDeviceDto): Promise<Device> {
    const result: Device = await firstValueFrom(
      this.client.send({ cmd: 'addDevice' }, { userId, data })
    )
    return result
  }

  /**
   * Updates device details
   * @async
   * @param {string} userId - UUID credentials of the device owner
   * @param {string} deviceId - single UUID for device
   * @param {UpdateDeviceDTO} data - DTO obhject to be updated
   * @returns {Promise<Device>} - Updated device object
   */
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
