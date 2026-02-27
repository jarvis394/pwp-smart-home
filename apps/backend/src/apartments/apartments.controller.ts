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
import { ApartmentsService } from './apartments.service'
import { JwtAuthGuard } from '../auth/strategies/jwt.strategy'
import { RequestWithUser } from '../auth/auth.controller'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreateApartmentDto } from './dto/create-apartment.dto'
import { UpdateApartmentDto } from './dto/update-apartment.dto'

@ApiTags('apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  async getApartments(@Request() req: RequestWithUser) {
    return await this.apartmentsService.getApartments(req.user.userId)
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
    return await this.apartmentsService.create(req.user.userId, body)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() body: UpdateApartmentDto) {
    return await this.apartmentsService.update(id, body)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return await this.apartmentsService.delete(id)
  }
}
