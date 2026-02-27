import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { DevicesService } from './devices.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { AddDeviceReq } from '@smart-home/shared'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  async getDevices(@Request() req: RequestWithUser) {
    const devices = await this.devicesService.getDevices(req.user.userId)
    return devices
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  @ApiBearerAuth()
  async getFavoriteDevices(@Request() req: RequestWithUser) {
    const devices = await this.devicesService.getFavoriteDevices(
      req.user.userId
    )
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
    return state
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/onOff/toggle')
  @ApiBearerAuth()
  async toggleOnOff(@Request() req: RequestWithUser, @Param('id') id: string) {
    const state = await this.devicesService.toggleOnOff(req.user.userId, id)
    return state
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/delete')
  @ApiBearerAuth()
  async delete(@Request() req: RequestWithUser, @Param('id') id: string) {
    const state = await this.devicesService.delete(req.user.userId, id)
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
    return device
  }
}
