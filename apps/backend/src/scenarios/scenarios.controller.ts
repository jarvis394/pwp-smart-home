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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { Scenario } from './dto/scenario-response.dto'
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
  @ApiOperation({
    summary: 'List all scenarios',
    description: 'List of all automated scenarios',
  })
  @ApiResponse({
    status: 200,
    description: 'List of scenarios fetched successfully',
    type: Scenario,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Gets a scenario by ID',
    description: 'Gets a particular scenario by ID',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Scenario ID' })
  @ApiResponse({
    status: 200,
    description: 'Scenario details retrieved successfully',
    type: Scenario,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async getById(@Request() req: RequestWithUser, @Param('id') id: string) {
    return await this.scenariosService.getById(req.user.userId, id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Creates a new scenario',
    description: 'Creates a new scenario',
  })
  @ApiResponse({ status: 201, description: 'New scenario added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Update a scenario',
    description: 'Updates a scenario',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Scenario updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
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
  @ApiOperation({
    summary: 'Toggle scenario activation',
    description: 'Enable/disable the scenario',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Scenario status changed successfully',
    schema: {
      example: { isActive: true },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
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
  @ApiOperation({
    summary: 'Deletes a scenario',
    description: 'Deletes a scenario',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Scenario deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
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
