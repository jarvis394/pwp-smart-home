/**
 * @file Controller for handling Room resources
 *  Handles HTTP requests, input validators using NestJSS, and cache using NestJS/cache-manager
 * Security on HTTP routes are handled with JwtAuthGuard, UserOwnershipGuard and @ApiBearerAuth()
 */

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
  BadRequestException,
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

@ApiTags('rooms')
@Controller('user/:user_id/rooms')
@UseGuards(JwtAuthGuard, UserOwnershipGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

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
  @ApiResponse({
    status: 200,
    description: 'List of rooms',
    type: Room,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  /**
   * List of rooms for an specific userId with optional filters
   * @async
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} [apartmentId] - Additional filter (optional) for a specific apartment
   * @param {string} [location] - Additional filter (optional) for a specific location
   * @returns {Promise<Room[]>} - List of room objects
   */
  async getRooms(
    @Param('user_id') userId: string,
    @Query('apartment') apartmentId?: string
  ) {
    const cacheKey = `rooms-${userId}${
      apartmentId ? `-apt-${apartmentId}` : ''
    }`
    const cached = await this.cacheManager.get<Room[]>(cacheKey)
    if (cached) return cached

    const rooms = await this.roomsService.getRooms(userId, {
      apartmentId,
    })
    await this.cacheManager.set(cacheKey, rooms)
    const trackingKey = `cache-keys-${userId}`
    const existingKeys: string[] =
      (await this.cacheManager.get(trackingKey)) || []
    if (!existingKeys.includes(cacheKey)) {
      existingKeys.push(cacheKey)
      await this.cacheManager.set(trackingKey, existingKeys)
    }
    return rooms
  }

  @Get(':room_id')
  @ApiOperation({ summary: 'Get a single room by ID' })
  @ApiParam({ name: 'room_id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Room found', type: Room })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  /**
   * Gets a single specific room for an specific userId
   * This method relies on Rooms Service verification to handle the room ownership verification
   * @async
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} roomId - UUID value for the room
   * @returns {Promise<Room>} - Single Room object
   */
  async getById(
    @Param('user_id') userId: string,
    @Param('room_id') roomId: string
  ) {
    return await this.roomsService.getById(userId, roomId)
  }

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
  /**
   * Creates a new Room for an specific userId on a single specific apartmentId.
   * It calls the respective DTO object and relies on Rooms Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} apartmentId - UUID value for the apartment
   * @param {CreateDTO} data - DTO for Room creation
   * @returns {Promise<Room>} - Single room creation object
   */
  async create(
    @Param('user_id') userId: string,
    @Query('apartment') apartmentId: string,
    @Body() body: CreateRoomDto
  ) {
    if (!apartmentId) {
      throw new BadRequestException('Missing required apartment query')
    }

    const room = await this.roomsService.create(userId, apartmentId, body)
    await this.invalidateRoomCaches(userId)
    return room
  }

  @Put(':room_id')
  @ApiOperation({ summary: 'Update room details' })
  @ApiParam({ name: 'room_id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Room updated', type: Room })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  /**
   * Updates a new Room for an specific userId.
   * It calls the respective DTO object and relies on Rooms Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} [roomId] - UUID value for the room
   * @param {UpdateDTO} data - DTO for Room update
   * @returns {Promise<Room>} - Single room update object
   */
  async update(
    @Param('user_id') userId: string,
    @Param('room_id') roomId: string,
    @Body() body: UpdateRoomDto
  ) {
    const room = await this.roomsService.update(userId, roomId, body)
    await this.invalidateRoomCaches(userId)
    return room
  }

  @Delete(':room_id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiParam({ name: 'room_id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Room deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  /**
   * Deletes a specific Room for an specific userId.
   * It calls the respective DTO object and relies on Rooms Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} [roomId] - UUID value for the room
   * @returns {Promise<boolean>} - True if successful
   */
  async delete(
    @Param('user_id') userId: string,
    @Param('room_id') roomId: string
  ) {
    await this.roomsService.delete(userId, roomId)
    await this.invalidateRoomCaches(userId)
    return { success: true }
  }

  /**
   * Invalidates all Room caches for an specific userId
   * Called every time a room is created, deleted or updated to verify data consistency
   * @private
   * @async
   * @param {string} userId - UUID identifier of user that needs the cache clearing
   * @returns {Promise<void>}
   */
  private async invalidateRoomCaches(userId: string) {
    const trackingKey = `cache-keys-${userId}`
    const keys: string[] = (await this.cacheManager.get(trackingKey)) || []

    await Promise.all(keys.map((key) => this.cacheManager.del(key)))
    await this.cacheManager.del(trackingKey)
  }

  public static getRoomsCacheKey(userId: string): string {
    return `rooms-${userId}`
  }
}
