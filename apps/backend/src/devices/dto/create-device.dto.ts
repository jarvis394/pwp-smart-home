import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsObject,
} from 'class-validator'
import { DeviceCapabilities, DeviceState } from '@smart-home/db'

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

  @ApiPropertyOptional({ example: {} })
  @IsOptional()
  @IsObject()
  capabilities?: DeviceCapabilities

  @ApiPropertyOptional({ example: {} })
  @IsOptional()
  @IsObject()
  state?: DeviceState

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  roomId?: string
}
