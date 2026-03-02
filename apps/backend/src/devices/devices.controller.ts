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
import { DevicesService } from './devices.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { AddDeviceReq } from '@smart-home/shared'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
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

  @UseGuards(JwtAuthGuard)
  @Get(':id/favorite')
  @ApiBearerAuth()
  async toggleFavorite(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    const state = await this.devicesService.toggleFavorite(req.user.userId, id)
    await this.invalidateDeviceCaches(req.user.userId)
    return state
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/onOff/toggle')
  @ApiBearerAuth()
  async toggleOnOff(@Request() req: RequestWithUser, @Param('id') id: string) {
    const state = await this.devicesService.toggleOnOff(req.user.userId, id)
    await this.invalidateDeviceCaches(req.user.userId)
    return state
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/delete')
  @ApiBearerAuth()
  async delete(@Request() req: RequestWithUser, @Param('id') id: string) {
    const state = await this.devicesService.delete(req.user.userId, id)
    await this.invalidateDeviceCaches(req.user.userId)
    return state
  }

  @UseGuards(JwtAuthGuard)
  @Post('add')
  @ApiBearerAuth()
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
