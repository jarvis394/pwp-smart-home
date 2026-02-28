import { ApiProperty } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString } from 'class-validator'

export class UpdateScenarioDto {
  @ApiProperty({ example: 'Morning Routine', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ example: [], required: false })
  @IsObject()
  @IsOptional()
  actions?: object
}
