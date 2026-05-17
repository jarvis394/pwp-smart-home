/**
 * @file DTO for Update Devices
 * Data validation reinforcement when user updates a device
 */
import { ApiPropertyOptional } from '@nestjs/swagger'
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

export class UpdateDeviceDto {
  @ApiPropertyOptional({ description: 'New device name' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: 'New model string' })
  @IsOptional()
  @IsString()
  model?: string

  @ApiPropertyOptional({ description: 'New device type' })
  @IsOptional()
  @IsString()
  type?: string

  @ApiPropertyOptional({ description: 'Toggle favorite status' })
  @IsOptional()
  @IsBoolean()
  favorite?: boolean

  @ApiPropertyOptional({
    type: DeviceCapabilitiesDto,
    description: 'Update device capabilities',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceCapabilitiesDto)
  capabilities?: DeviceCapabilitiesDto

  @ApiPropertyOptional({
    description: 'Update device state',
    enum: DeviceState,
    example: DeviceState.ONLINE,
  })
  @IsOptional()
  @IsEnum(DeviceState)
  state?: DeviceState

  @ApiPropertyOptional({
    description: 'Move device to a different room (UUID)',
  })
  @IsOptional()
  @IsUUID()
  roomId?: string
}
