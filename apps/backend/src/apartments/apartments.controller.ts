import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  Inject,
} from '@nestjs/common'
import { ApartmentsService } from './apartments.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreateApartmentDto } from './dto/create-apartment.dto'
import { UpdateApartmentDto } from './dto/update-apartment.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@ApiTags('apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(
    private readonly apartmentsService: ApartmentsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  async getApartments(@Request() req: RequestWithUser) {
    const cacheKey = ApartmentsController.getApartmentsCacheKey(req.user.userId)
    const cached = await this.cacheManager.get(cacheKey)

    if (cached) {
      return cached
    }

    const result = await this.apartmentsService.getApartments(req.user.userId)
    await this.cacheManager.set(cacheKey, result)
    return result
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  async getById(@Request() req: RequestWithUser, @Param('id') id: string) {
    return await this.apartmentsService.getById(req.user.userId, id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  async create(
    @Request() req: RequestWithUser,
    @Body() body: CreateApartmentDto
  ) {
    const result = await this.apartmentsService.create(req.user.userId, body)
    const cacheKey = ApartmentsController.getApartmentsCacheKey(req.user.userId)
    await this.cacheManager.del(cacheKey)
    return result
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateApartmentDto
  ) {
    const result = await this.apartmentsService.update(
      req.user.userId,
      id,
      body
    )
    const cacheKey = ApartmentsController.getApartmentsCacheKey(req.user.userId)
    await this.cacheManager.del(cacheKey)
    return result
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Request() req: RequestWithUser, @Param('id') id: string) {
    const result = await this.apartmentsService.delete(req.user.userId, id)
    const cacheKey = ApartmentsController.getApartmentsCacheKey(req.user.userId)
    await this.cacheManager.del(cacheKey)
    return result
  }

  public static getApartmentsCacheKey(userId: string): string {
    return `apartments-${userId}`
  }
}
