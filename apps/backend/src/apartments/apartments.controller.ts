/**
 * @file Controller for handling Apartment resources
 *  Handles HTTP requests, input validators using NestJSS, and cache using NestJS/cache-manager
 * Security on HTTP routes are handled with JwtAuthGuard, OwnershipGuard and @ApiBearerAuth()
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
  UseGuards,
} from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { ApartmentsService } from './apartments.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { UserOwnershipGuard } from '../auth/guards/user-ownership.guard'
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'
import { Apartment } from './dto/apartment-response-dto'
import { CreateApartmentDto } from './dto/create-apartment.dto'
import { UpdateApartmentDto } from './dto/update-apartment.dto'

// ApartmentsController handles all CRUD operations for apartments owned by a user.
@ApiTags('apartments')
@Controller('user/:user_id/apartments')
@UseGuards(JwtAuthGuard, UserOwnershipGuard)
@ApiBearerAuth()
export class ApartmentsController {
  constructor(
    private readonly apartmentsService: ApartmentsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all apartments of a user',
    description: 'Returns all apartments owned by the specified user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Apartment list fetched successfully',
    type: Apartment,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  /**
   * List of apartments for an specific userId
   * This method relies on Apartments service verification to handle ownership verification
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the apartment owner
   * @returns {Promise<Apartment[]>} - List of apartment objects
   */
  async getApartments(@Param('user_id') userId: string) {
    const cacheKey = ApartmentsController.getApartmentsCacheKey(userId)
    const cached = await this.cacheManager.get(cacheKey)
    if (cached) return cached

    const result = await this.apartmentsService.getApartments(userId)
    await this.cacheManager.set(cacheKey, result)
    return result
  }

  @Get(':apartment_id')
  @ApiOperation({
    summary: 'Get a single apartment',
    description: 'Fetches a specific apartment owned by the user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Apartment fetched successfully',
    type: Apartment,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Apartment not found' })
  /**
   * Gets a single specific apartment for an specific userId
   * This method relies on Apartments Service verification to handle the ownership verification
   * @async
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} apartmentId - UUID value for the apartment
   * @returns {Promise<Apartment>} - Single Apartment object
   */
  async getById(
    @Param('user_id') userId: string,
    @Param('apartment_id') apartmentId: string
  ) {
    return await this.apartmentsService.getById(userId, apartmentId)
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new apartment',
    description: 'Creates a new apartment for the specified user.',
  })
  @ApiResponse({ status: 201, description: 'Apartment created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request – some fields are missing',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  /**
   * Creates a new Apartment for an specific userId.
   * It calls the respective DTO object and relies on Apartments Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the apartment owner
   * @Body CreateApartmentDTO - DTO for Apartment creation
   * @returns {Promise<Apartment>} - Single apartment creation object
   */
  async create(
    @Param('user_id') userId: string,
    @Body() body: CreateApartmentDto
  ) {
    const result = await this.apartmentsService.create(userId, body)
    const cacheKey = ApartmentsController.getApartmentsCacheKey(userId)
    await this.cacheManager.del(cacheKey)
    return result
  }

  @Put(':apartment_id')
  @ApiOperation({
    summary: 'Update apartment details',
    description: 'Updates the details of an apartment.',
  })
  @ApiResponse({ status: 200, description: 'Apartment updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Apartment not found' })
  /**
   * Updates an Apartment for an specific userId.
   * It calls the respective DTO object and relies on Apartments Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the apartment owner
   * @param {string} apartmentId - UUID value for the apartment
   * @Body UpdateApartmentDTO - DTO for apartment update
   * @returns {Promise<Apartment>} - Single apartment update object
   */
  async update(
    @Param('user_id') userId: string,
    @Param('apartment_id') apartmentId: string,
    @Body() body: UpdateApartmentDto
  ) {
    const result = await this.apartmentsService.update(
      userId,
      apartmentId,
      body
    )
    const cacheKey = ApartmentsController.getApartmentsCacheKey(userId)
    await this.cacheManager.del(cacheKey)
    return result
  }

  @Delete(':apartment_id')
  @ApiOperation({
    summary: 'Delete an apartment',
    description: 'Deletes an apartment.',
  })
  @ApiResponse({ status: 200, description: 'Apartment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Apartment not found' })
  /**
   * Deletes a specific Apartment for an specific userId.
   * Relies on Apartment Service verification to handle the specific request
   * Helper method to clear cache is used to clean the cache request
   * @async
   * @param {string} userId - UUID credentials of the apartment owner
   * @param {string} apartmentId - UUID value for the apartment
   * @returns {Promise<boolean>} - True if successful
   */
  async delete(
    @Param('user_id') userId: string,
    @Param('apartment_id') apartmentId: string
  ) {
    const result = await this.apartmentsService.delete(userId, apartmentId)
    const cacheKey = ApartmentsController.getApartmentsCacheKey(userId)
    await this.cacheManager.del(cacheKey)
    return result
  }

  public static getApartmentsCacheKey(userId: string): string {
    return `apartments-${userId}`
  }
}
