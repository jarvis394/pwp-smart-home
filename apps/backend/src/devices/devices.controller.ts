import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  Inject,
} from '@nestjs/common'
import { Device } from './dto/device.dto'
import { CreateDeviceReq } from './dto/add-device-dto'
import { DevicesService } from './devices.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { AddDeviceReq } from '@smart-home/shared'
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all devices',
    description: 'List all devices',
  })
  @ApiResponse({
    status: 200,
    description: 'List of devices owned by the user',
    type: Device,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDevices(@Request() req: RequestWithUser) {
    const cacheKey = DevicesController.getDevicesCacheKey(req.user.userId)
    const cached = await this.cacheManager.get(cacheKey)
    if (cached) return cached

    const devices = await this.devicesService.getDevices(req.user.userId)
    await this.cacheManager.set(cacheKey, devices)
    return devices
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get favorite devices',
    description: 'Get favorite devices',
  })
  @ApiResponse({
    status: 200,
    description: 'List of favorite devices',
    type: Device,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFavoriteDevices(@Request() req: RequestWithUser) {
    const cacheKey = DevicesController.getFavoriteDevicesCacheKey(
      req.user.userId
    )
    const cached = await this.cacheManager.get(cacheKey)
    if (cached) return cached

    const devices = await this.devicesService.getFavoriteDevices(
      req.user.userId
    )
    await this.cacheManager.set(cacheKey, devices)
    return devices
  }
  //TOEDIT THIS OLS
  @UseGuards(JwtAuthGuard)
  @Get(':id/favorite')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle device favorite status',
    description: 'Favorite toggle status',
  })
  @ApiResponse({
    status: 200,
    description: 'Toggle status saved successfully',
    schema: { type: 'boolean', example: 'true' },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async toggleFavorite(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    const state = await this.devicesService.toggleFavorite(req.user.userId, id)
    await this.invalidateDeviceCaches(req.user.userId)
    return state
  }
  ///
  @UseGuards(JwtAuthGuard)
  @Get(':id/onOff/toggle')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle on/off status',
    description: 'Toggle on/off status',
  })
  @ApiResponse({
    status: 200,
    description: 'Toggle on/off status changed successfully',
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async toggleOnOff(@Request() req: RequestWithUser, @Param('id') id: string) {
    const state = await this.devicesService.toggleOnOff(req.user.userId, id)
    await this.invalidateDeviceCaches(req.user.userId)
    return state
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/delete')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletes a device',
    description: 'Deletes a device',
  })
  @ApiResponse({
    status: 200,
    description: 'Device deleted successfully',
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async delete(@Request() req: RequestWithUser, @Param('id') id: string) {
    const state = await this.devicesService.delete(req.user.userId, id)
    await this.invalidateDeviceCaches(req.user.userId)
    return state
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Adds a new device',
    description: 'Adds a new device',
  })
  @ApiBody({ type: CreateDeviceReq })
  @ApiResponse({
    status: 201,
    description: 'New device added successfully',
    type: Device,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addDevice(
    @Request() req: RequestWithUser,
    @Body() newDevice: AddDeviceReq
  ) {
    const device = await this.devicesService.addDevice(
      req.user.userId,
      newDevice
    )
    await this.invalidateDeviceCaches(req.user.userId)
    return device
  }

  public static getDevicesCacheKey(userId: string): string {
    return `devices-${userId}`
  }

  public static getFavoriteDevicesCacheKey(userId: string): string {
    return `devices-fav-${userId}`
  }

  private async invalidateDeviceCaches(userId: string) {
    await this.cacheManager.del(DevicesController.getDevicesCacheKey(userId))
    await this.cacheManager.del(
      DevicesController.getFavoriteDevicesCacheKey(userId)
    )
  }
}
