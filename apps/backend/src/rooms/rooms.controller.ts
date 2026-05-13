import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { RoomsService } from './rooms.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { UserOwnershipGuard } from '../auth/guards/user-ownership.guard'
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger'
import { Room } from './dto/room-response-dto'
import { CreateRoomDto } from './dto/create-room.dto'
import { UpdateRoomDto } from './dto/update-room.dto'

// Controller for managing rooms within user apartments, including CRUD operations
// and filtering capabilities, with caching for improved performance
@ApiTags('rooms')
@Controller('user/:user_id/rooms')
@UseGuards(JwtAuthGuard, UserOwnershipGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  // Endpoint to retrieve all rooms for a user, with optional filtering by apartment
  // and location, and caching for performance
  @Get()
  @ApiOperation({
    summary: 'List rooms of a user',
    description:
      'Returns all rooms belonging to a user. Optionally filter by apartment (?apartment=apartment_id) and/or apartment location (?location=city).',
  })
  @ApiQuery({
    name: 'apartment',
    required: false,
    description: 'Filter by apartment ID',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by apartment location (e.g., Oulu)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of rooms',
    type: Room,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  async getRooms(
    @Param('user_id') userId: string,
    @Query('apartment') apartmentId?: string,
    @Query('location') location?: string
  ) {
    const cacheKey = `rooms-${userId}${
      apartmentId ? `-apt-${apartmentId}` : ''
    }${location ? `-loc-${location}` : ''}`
    const cached = await this.cacheManager.get<Room[]>(cacheKey)
    if (cached) return cached

    const rooms = await this.roomsService.getRooms(userId, {
      apartmentId,
      location,
    })
    await this.cacheManager.set(cacheKey, rooms)
    return rooms
  }

  // Endpoint to retrieve a single room by its ID for a user, with appropriate error
  // handling and API documentation
  @Get(':room_id')
  @ApiOperation({ summary: 'Get a single room by ID' })
  @ApiParam({ name: 'room_id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Room found', type: Room })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getById(
    @Param('user_id') userId: string,
    @Param('room_id') roomId: string
  ) {
    return await this.roomsService.getById(userId, roomId)
  }

  // Endpoint to create a new room for a user within a specified apartment, with validation,
  // error handling, and cache invalidation
  @Post()
  @ApiOperation({
    summary: 'Create a new room',
    description:
      'Creates a room inside a specific apartment. The apartment ID must be provided via ?apartment=...',
  })
  @ApiQuery({
    name: 'apartment',
    required: true,
    description: 'ID of the apartment',
  })
  @ApiResponse({ status: 201, description: 'Room created', type: Room })
  @ApiResponse({ status: 400, description: 'Missing or invalid fields' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden – user_id mismatch or apartment does not belong to user',
  })
  async create(
    @Param('user_id') userId: string,
    @Query('apartment') apartmentId: string,
    @Body() body: CreateRoomDto
  ) {
    const room = await this.roomsService.create(userId, apartmentId, body)
    await this.invalidateRoomCaches(userId)
    return room
  }

  // Endpoint to update an existing room's details, allowing partial updates,
  // with validation, error handling, and cache invalidation
  @Put(':room_id')
  @ApiOperation({ summary: 'Update room details' })
  @ApiParam({ name: 'room_id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Room updated', type: Room })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async update(
    @Param('user_id') userId: string,
    @Param('room_id') roomId: string,
    @Body() body: UpdateRoomDto
  ) {
    const room = await this.roomsService.update(userId, roomId, body)
    await this.invalidateRoomCaches(userId)
    return room
  }

  // Endpoint to delete a room by its ID for a user, with appropriate error handling
  // and cache invalidation
  @Delete(':room_id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiParam({ name: 'room_id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Room deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async delete(
    @Param('user_id') userId: string,
    @Param('room_id') roomId: string
  ) {
    await this.roomsService.delete(userId, roomId)
    await this.invalidateRoomCaches(userId)
    return { success: true }
  }

  // Helper method to invalidate all room-related caches for a user,
  // called after any operation that modifies room data to ensure cache consistency
  private async invalidateRoomCaches(userId: string) {
    await this.cacheManager.del(`rooms-${userId}`)
  }

  public static getRoomsCacheKey(userId: string): string {
    return `rooms-${userId}`
  }
}
