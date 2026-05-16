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
} from 'class-validator'
import { DeviceCapabilities, DeviceState } from '@smart-home/db'

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

  @ApiPropertyOptional({ description: 'Update device capabilities' })
  @IsOptional()
  @IsObject()
  capabilities?: DeviceCapabilities

  @ApiPropertyOptional({ description: 'Update device state' })
  @IsOptional()
  @IsObject()
  state?: DeviceState

  @ApiPropertyOptional({
    description: 'Move device to a different room (UUID)',
  })
  @IsOptional()
  @IsUUID()
  roomId?: string
}
