/**
 * @file DTO for Create Device
 * Data validation reinforcement when user registers new device
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsObject,
  IsEnum,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { DeviceState } from '@smart-home/db'
import { DeviceCapabilitiesDto } from './capabilities.dto'

export class CreateDeviceDto {
  @ApiProperty({ example: 'Kitchen Light' })
  @IsString()
  name: string

  @ApiPropertyOptional({ example: 'Xiaomi TL-45' })
  @IsOptional()
  @IsString()
  model?: string

  @ApiProperty({ example: 'Light' })
  @IsString()
  type: string

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  favorite?: boolean

  @ApiPropertyOptional({ type: DeviceCapabilitiesDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceCapabilitiesDto)
  capabilities?: DeviceCapabilitiesDto

  @ApiPropertyOptional({ enum: DeviceState, example: DeviceState.ONLINE })
  @IsOptional()
  @IsEnum(DeviceState)
  state?: DeviceState

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  roomId?: string
}
