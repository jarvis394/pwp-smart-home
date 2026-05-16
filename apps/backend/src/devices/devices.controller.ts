/**
 * @file Controller for handling Scenario resources
 *  Handles HTTP requests, input validators using NestJSS, and cache using NestJS/cache-manager
 * Security on HTTP reoutes are handled with JwtAuthGuard and @ApiBearerAuth()
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  BadRequestException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common'
import { Device } from './dto/device.dto'
import { DevicesService } from './devices.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { UserOwnershipGuard } from '../auth/guards/user-ownership.guard'
import { CreateDeviceDto } from './dto/create-device.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@ApiTags('devices')
@Controller('user/:user_id/devices')
@UseGuards(JwtAuthGuard, UserOwnershipGuard)
@ApiBearerAuth()
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all devices of a user',
    description: 'Optional filter by room using ?room={roomId}',
  })
  @ApiQuery({ name: 'room', required: false })
  @ApiResponse({ status: 200, type: Device, isArray: true })
  /**
   * List of devices for an specific userId
   * This method relies on Devices Service verification to handle ownership verification
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the device owner
   * @param {string} roomId - UUID credentials of the room owner
   * @returns {Promise<Device[]>} - List of device objects
   */
  async getDevices(
    @Param('user_id') userId: string,
    @Query('room') roomId?: string
  ) {
    const cacheKey = `devices-${userId}${roomId ? `-room-${roomId}` : ''}`
    const cached = await this.cacheManager.get<Device[]>(cacheKey)
    if (cached) return cached

    const devices = await this.devicesService.getDevices(userId, roomId)
    await this.cacheManager.set(cacheKey, devices)
    const trackingKey = `cache-keys-${userId}`
    const existingKeys: string[] =
      (await this.cacheManager.get(trackingKey)) || []
    if (!existingKeys.includes(cacheKey)) {
      existingKeys.push(cacheKey)
      await this.cacheManager.set(trackingKey, existingKeys)
    }

    return devices
  }

  @Get(':device_id')
  @ApiOperation({ summary: 'Get a single device' })
  @ApiResponse({ status: 200, type: Device })
  @ApiResponse({ status: 404, description: 'Device not found' })
  /**
   * Gets a single specific device for an specific userId
   * This method relies on Devices Service verification to handle the ownership verification
   * @async
   * @param {string} userId - UUID credentials of the device owner
   * @param {string} deviceId - UUID value for the device
   * @throws {NotFoundException} - In case Device is not found
   * @returns {Promise<Device>} - Single Device object
   */
  async getDevice(
    @Param('user_id') userId: string,
    @Param('device_id') deviceId: string
  ): Promise<Device> {
    const devices = await this.devicesService.getDevices(userId)
    const device = devices.find((d) => d.id === deviceId)
    if (!device) {
      throw new NotFoundException('Device not found')
    }
    return device
  }

  @Post()
  @ApiOperation({ summary: 'Add a new device' })
  @ApiBody({ type: CreateDeviceDto })
  @ApiResponse({ status: 201, type: Device })
  /**
   * Creates a new Device for an specific userId.
   * It calls the respective DTO object and relies on Device Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the device owner
   * @Body CreateDeviceDTO - DTO for Device creation
   * @returns {Promise<Device>} - Single device creation object
   */
  async addDevice(
    @Param('user_id') userId: string,
    @Body() newDevice: CreateDeviceDto
  ) {
    const device = await this.devicesService.addDevice(userId, newDevice)
    await this.invalidateDeviceCaches(userId)
    return device
  }

  @Put(':device_id')
  @ApiOperation({ summary: 'Update a device' })
  @ApiBody({ type: UpdateDeviceDto })
  @ApiResponse({ status: 200, type: Device })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  /**
   * Updates a Device for an specific userId.
   * It calls the respective DTO object and relies on Devices Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * *@async
   * @param {string} userId - UUID credentials of the device owner
   * @param {string} deviceId - UUID value for the device
   * @Body UpdateDeviceDTO - DTO for device update
   * @returns {Promise<Device>} - Single device update object
   */
  async updateDevice(
    @Param('user_id') userId: string,
    @Param('device_id') deviceId: string,
    @Body() update: UpdateDeviceDto
  ): Promise<Device> {
    const device = await this.devicesService.updateDevice(
      userId,
      deviceId,
      update
    )
    await this.invalidateDeviceCaches(userId)
    return device
  }

  @Put(':device_id/favorite')
  @ApiOperation({ summary: 'Toggle favorite' })
  @ApiResponse({
    status: 200,
    schema: { type: 'object', properties: { favorite: { type: 'boolean' } } },
  })
  /**
   * Sets a specific deviceId as favorite.
   * Relies on Device Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the device owner
   * @param {string} deviceId - UUID value for the device
   * @returns {Promise<boolean>} - True if set as favorite
   */
  async toggleFavorite(
    @Param('user_id') userId: string,
    @Param('device_id') deviceId: string
  ) {
    const state = await this.devicesService.toggleFavorite(userId, deviceId)
    await this.invalidateDeviceCaches(userId)
    return state
  }

  @Put(':device_id/state')
  @ApiOperation({ summary: 'Toggle power state' })
  @ApiQuery({ name: 'toggle', required: true, enum: ['on', 'off'] })
  @ApiResponse({ status: 200, description: 'State changed' })
  /**
   * Sets a specific state for an specific deviceId.
   * Relies on Device Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the device owner
   * @param {string} deviceId - UUID value for the device
   * @param {string} toggle - on/off state
   * @throws {BadRequestException} - if input is missing
   * @returns {Promise<boolean>} - True if state is active
   */
  async setState(
    @Param('user_id') userId: string,
    @Param('device_id') deviceId: string,
    @Query('toggle') toggle: 'on' | 'off'
  ) {
    if (!toggle) throw new BadRequestException('Missing toggle parameter')
    const result = await this.devicesService.setState(
      userId,
      deviceId,
      toggle === 'on'
    )
    await this.invalidateDeviceCaches(userId)
    return result
  }

  @Delete(':device_id')
  @ApiOperation({ summary: 'Delete a device' })
  @ApiResponse({ status: 200, description: 'Device deleted' })
  /**
   * Deletes a specific Device for an specific userId.
   * Relies on Device Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the device owner
   * @param {string} deviceId - UUID value for the device
   * @returns {Promise<boolean>} - True if successful
   */
  async deleteDevice(
    @Param('user_id') userId: string,
    @Param('device_id') deviceId: string
  ) {
    await this.devicesService.delete(userId, deviceId)
    await this.invalidateDeviceCaches(userId)
    return { success: true }
  }

  private async invalidateDeviceCaches(userId: string) {
    const trackingKey = `cache-keys-${userId}`
    const keys: string[] = (await this.cacheManager.get(trackingKey)) || []

    const allKeys = [...keys, trackingKey, `devices-fav-${userId}`]

    await Promise.all(allKeys.map((key) => this.cacheManager.del(key)))
  }
}
