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
import { ScenariosService } from './scenarios.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreateScenarioDto } from './dto/create-scenario.dto'
import { UpdateScenarioDto } from './dto/update-scenario.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(
    private readonly scenariosService: ScenariosService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  async getScenarios(@Request() req: RequestWithUser) {
    const cacheKey = ScenariosController.getScenariosCacheKey(req.user.userId)
    const cached = await this.cacheManager.get(cacheKey)
    if (cached) return cached

    const scenarios = await this.scenariosService.getScenarios(req.user.userId)
    await this.cacheManager.set(cacheKey, scenarios)
    return scenarios
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  async getById(@Request() req: RequestWithUser, @Param('id') id: string) {
    return await this.scenariosService.getById(req.user.userId, id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  async create(
    @Request() req: RequestWithUser,
    @Body() body: CreateScenarioDto
  ) {
    const scenario = await this.scenariosService.create(req.user.userId, body)
    await this.cacheManager.del(
      ScenariosController.getScenariosCacheKey(req.user.userId)
    )
    return scenario
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateScenarioDto
  ) {
    const scenario = await this.scenariosService.update(id, body)
    await this.cacheManager.del(
      ScenariosController.getScenariosCacheKey(req.user.userId)
    )
    return scenario
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/toggle')
  @ApiBearerAuth()
  async toggleActive(@Request() req: RequestWithUser, @Param('id') id: string) {
    const state = await this.scenariosService.toggleActive(req.user.userId, id)
    await this.cacheManager.del(
      ScenariosController.getScenariosCacheKey(req.user.userId)
    )
    return state
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Request() req: RequestWithUser, @Param('id') id: string) {
    const state = await this.scenariosService.delete(id)
    await this.cacheManager.del(
      ScenariosController.getScenariosCacheKey(req.user.userId)
    )
    return state
  }

  public static getScenariosCacheKey(userId: string): string {
    return `scenarios-${userId}`
  }
}
