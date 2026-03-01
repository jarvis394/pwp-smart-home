import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreateRoomDto } from './dto/create-room.dto'
import { UpdateRoomDto } from './dto/update-room.dto'

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('apartment/:apartmentId')
  @ApiBearerAuth()
  async getRooms(@Param('apartmentId') apartmentId: string) {
    return await this.roomsService.getRooms(apartmentId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  async getById(@Param('id') id: string) {
    return await this.roomsService.getById(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  async create(@Body() body: CreateRoomDto) {
    return await this.roomsService.create(body)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() body: UpdateRoomDto) {
    return await this.roomsService.update(id, body)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return await this.roomsService.delete(id)
  }
}
