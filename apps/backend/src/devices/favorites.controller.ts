import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { UserOwnershipGuard } from '../auth/guards/user-ownership.guard'
import { DevicesService } from './devices.service'
import { Device } from './dto/device.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('devices')
@Controller('user/:user_id')
@UseGuards(JwtAuthGuard, UserOwnershipGuard)
@ApiBearerAuth()
export class UserFavoritesController {
  constructor(
    private readonly devicesService: DevicesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get('favorites')
  @ApiOperation({ summary: 'Get favorite devices of a user' })
  @ApiResponse({ status: 200, type: Device, isArray: true })
  async getFavorites(@Param('user_id') userId: string) {
    const cacheKey = `devices-fav-${userId}`
    const cached = await this.cacheManager.get<Device[]>(cacheKey)
    if (cached) return cached

    const devices = await this.devicesService.getFavoriteDevices(userId)
    await this.cacheManager.set(cacheKey, devices)
    return devices
  }
}
