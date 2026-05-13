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
import { ScenariosService } from './scenarios.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { UserOwnershipGuard } from '../auth/guards/user-ownership.guard'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger'
import { Scenario } from './dto/scenario-response.dto'
import { CreateScenarioDto } from './dto/create-scenario.dto'
import { UpdateScenarioDto } from './dto/update-scenario.dto'

@ApiTags('scenarios')
@Controller('user/:user_id/scenarios')
@UseGuards(JwtAuthGuard, UserOwnershipGuard)
@ApiBearerAuth()
export class ScenariosController {
  constructor(
    private readonly scenariosService: ScenariosService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all scenarios of a user',
    description:
      'Returns all automated scenarios belonging to the specified user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of scenarios fetched successfully',
    type: Scenario,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  async getScenarios(@Param('user_id') userId: string) {
    const cacheKey = ScenariosController.getScenariosCacheKey(userId)
    const cached = await this.cacheManager.get<Scenario[]>(cacheKey)
    if (cached) return cached

    const scenarios = await this.scenariosService.getScenarios(userId)
    await this.cacheManager.set(cacheKey, scenarios)
    return scenarios
  }

  @Get(':scenario_id')
  @ApiOperation({
    summary: 'Get a single scenario',
    description: 'Fetches a specific scenario owned by the user.',
  })
  @ApiParam({ name: 'scenario_id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Scenario details retrieved successfully',
    type: Scenario,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async getById(
    @Param('user_id') userId: string,
    @Param('scenario_id') scenarioId: string
  ) {
    return await this.scenariosService.getById(userId, scenarioId)
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new scenario',
    description: 'Creates a new automated scenario for the specified user.',
  })
  @ApiResponse({ status: 201, description: 'New scenario added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request – validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  async create(
    @Param('user_id') userId: string,
    @Body() body: CreateScenarioDto
  ) {
    const scenario = await this.scenariosService.create(userId, body)
    const cacheKey = ScenariosController.getScenariosCacheKey(userId)
    await this.cacheManager.del(cacheKey)
    return scenario
  }

  @Put(':scenario_id')
  @ApiOperation({
    summary: 'Update a scenario',
    description: 'Updates an existing scenario. Only the owner can modify it.',
  })
  @ApiParam({ name: 'scenario_id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Scenario updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async update(
    @Param('user_id') userId: string,
    @Param('scenario_id') scenarioId: string,
    @Body() body: UpdateScenarioDto
  ) {
    const scenario = await this.scenariosService.update(
      userId,
      scenarioId,
      body
    )
    const cacheKey = ScenariosController.getScenariosCacheKey(userId)
    await this.cacheManager.del(cacheKey)
    return scenario
  }

  @Put(':scenario_id/state')
  @ApiOperation({
    summary: 'Set scenario active state',
    description:
      'Activates or deactivates the scenario. Use ?active=true to enable, ?active=false to disable.',
  })
  @ApiQuery({ name: 'active', required: true, type: 'boolean', example: true })
  @ApiResponse({
    status: 200,
    description: 'Scenario state updated successfully',
    type: Scenario,
  })
  @ApiResponse({
    status: 400,
    description: 'Missing or invalid active parameter',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async setState(
    @Param('user_id') userId: string,
    @Param('scenario_id') scenarioId: string,
    @Query('active') active: string
  ) {
    if (active !== 'true' && active !== 'false') {
      throw new BadRequestException('active must be "true" or "false"')
    }
    const isActive = active === 'true'
    const scenario = await this.scenariosService.setActive(
      userId,
      scenarioId,
      isActive
    )
    const cacheKey = ScenariosController.getScenariosCacheKey(userId)
    await this.cacheManager.del(cacheKey)
    return scenario
  }

  @Delete(':scenario_id')
  @ApiOperation({
    summary: 'Delete a scenario',
    description: 'Deletes a scenario. Only the owner can delete it.',
  })
  @ApiParam({ name: 'scenario_id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Scenario deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden – user_id mismatch' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async delete(
    @Param('user_id') userId: string,
    @Param('scenario_id') scenarioId: string
  ) {
    await this.scenariosService.delete(userId, scenarioId)
    const cacheKey = ScenariosController.getScenariosCacheKey(userId)
    await this.cacheManager.del(cacheKey)
    return { success: true }
  }

  public static getScenariosCacheKey(userId: string): string {
    return `scenarios-${userId}`
  }
}
