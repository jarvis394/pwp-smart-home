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
} from '@nestjs/common'
import { ScenariosService } from './scenarios.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreateScenarioDto } from './dto/create-scenario.dto'
import { UpdateScenarioDto } from './dto/update-scenario.dto'

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  async getScenarios(@Request() req: RequestWithUser) {
    return await this.scenariosService.getScenarios(req.user.userId)
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
    return await this.scenariosService.create(req.user.userId, body)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() body: UpdateScenarioDto) {
    return await this.scenariosService.update(id, body)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/toggle')
  @ApiBearerAuth()
  async toggleActive(@Request() req: RequestWithUser, @Param('id') id: string) {
    return await this.scenariosService.toggleActive(req.user.userId, id)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return await this.scenariosService.delete(id)
  }
}
