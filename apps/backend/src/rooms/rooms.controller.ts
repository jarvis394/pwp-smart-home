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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger'
import { Room } from './dto/room-response-dto'
import { CreateRoomDto } from './dto/create-room.dto'
import { UpdateRoomDto } from './dto/update-room.dto'

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('apartment/:apartmentId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all rooms in one apartment',
    description: 'Get all rooms in one apartment',
  })
  @ApiParam({ name: 'apartmentId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'List of rooms fetched successfully',
    type: Room,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Apartment not found' })
  async getRooms(@Param('apartmentId') apartmentId: string) {
    return await this.roomsService.getRooms(apartmentId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gets a single room by ID',
    description: 'Gets a single room by ID',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Rooms fetched successfully',
    type: Room,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not registered' })
  async getById(@Param('id') id: string) {
    return await this.roomsService.getById(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Creates a new room',
    description: 'Creates a new room in an apartment',
  })
  @ApiResponse({ status: 200, description: 'Room created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - missing fields' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() body: CreateRoomDto) {
    return await this.roomsService.create(body)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update room details',
    description: 'Updates the details of a room',
  })
  @ApiResponse({
    status: 200,
    description: 'Room details updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not registered' })
  async update(@Param('id') id: string, @Body() body: UpdateRoomDto) {
    return await this.roomsService.update(id, body)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletes a room',
    description: 'Deletes a room by ID',
  })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not registered' })
  async delete(@Param('id') id: string) {
    return await this.roomsService.delete(id)
  }
}
