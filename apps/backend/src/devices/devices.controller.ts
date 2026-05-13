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

// Controller for managing user devices, including CRUD operations and state management,
// with caching for improved performance
@ApiTags('devices')
@Controller('user/:user_id/devices')
@UseGuards(JwtAuthGuard, UserOwnershipGuard)
@ApiBearerAuth()
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  // Endpoint to retrieve all devices for a user, with optional filtering by room,
  // and caching for performance
  @Get()
  @ApiOperation({
    summary: 'List all devices of a user',
    description: 'Optional filter by room using ?room={roomId}',
  })
  @ApiQuery({ name: 'room', required: false })
  @ApiResponse({ status: 200, type: Device, isArray: true })
  async getDevices(
    @Param('user_id') userId: string,
    @Query('room') roomId?: string
  ) {
    const cacheKey = `devices-${userId}${roomId ? `-room-${roomId}` : ''}`
    const cached = await this.cacheManager.get<Device[]>(cacheKey)
    if (cached) return cached
    const devices = await this.devicesService.getDevices(userId, roomId)
    await this.cacheManager.set(cacheKey, devices)
    return devices
  }

  // Endpoint to retrieve a single device by its ID, throwing a 404 error if not found
  @Get(':device_id')
  @ApiOperation({ summary: 'Get a single device' })
  @ApiResponse({ status: 200, type: Device })
  @ApiResponse({ status: 404, description: 'Device not found' })
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

  // Endpoint to retrieve all favorite devices for a user, with caching for performance
  @Post()
  @ApiOperation({ summary: 'Add a new device' })
  @ApiBody({ type: CreateDeviceDto })
  @ApiResponse({ status: 201, type: Device })
  async addDevice(
    @Param('user_id') userId: string,
    @Body() newDevice: CreateDeviceDto
  ) {
    const device = await this.devicesService.addDevice(userId, newDevice)
    await this.invalidateDeviceCaches(userId)
    return device
  }

  // Endpoint to update an existing device, allowing partial updates, and throwing a
  // 404 error if the device is not found
  @Put(':device_id')
  @ApiOperation({ summary: 'Update a device' })
  @ApiBody({ type: UpdateDeviceDto })
  @ApiResponse({ status: 200, type: Device })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Device not found' })
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

  // Endpoint to toggle the favorite status of a device, returning the new status,
  // and throwing a 404 error if the device is not found
  @Put(':device_id/favorite')
  @ApiOperation({ summary: 'Toggle favorite' })
  @ApiResponse({
    status: 200,
    schema: { type: 'object', properties: { favorite: { type: 'boolean' } } },
  })
  async toggleFavorite(
    @Param('user_id') userId: string,
    @Param('device_id') deviceId: string
  ) {
    const state = await this.devicesService.toggleFavorite(userId, deviceId)
    await this.invalidateDeviceCaches(userId)
    return state
  }

  // Endpoint to set the power state of a device (on/off), throwing a 400 error
  // if the toggle parameter is missing, and a 404 error if the device is not found
  @Put(':device_id/state')
  @ApiOperation({ summary: 'Toggle power state' })
  @ApiQuery({ name: 'toggle', required: true, enum: ['on', 'off'] })
  @ApiResponse({ status: 200, description: 'State changed' })
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

  // Endpoint to delete a device, throwing a 404 error if the device is not found
  @Delete(':device_id')
  @ApiOperation({ summary: 'Delete a device' })
  @ApiResponse({ status: 200, description: 'Device deleted' })
  async deleteDevice(
    @Param('user_id') userId: string,
    @Param('device_id') deviceId: string
  ) {
    await this.devicesService.delete(userId, deviceId)
    await this.invalidateDeviceCaches(userId)
    return { success: true }
  }

  // Helper method to invalidate device-related caches for a user after changes
  // to ensure data consistency
  private async invalidateDeviceCaches(userId: string) {
    await this.cacheManager.del(`devices-${userId}`)
    await this.cacheManager.del(`devices-fav-${userId}`)
  }
}
