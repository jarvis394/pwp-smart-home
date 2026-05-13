import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsUUID } from 'class-validator'

// Data Transfer Object (DTO) for updating an existing device,
// allowing optional fields for partial updates
export class UpdateDeviceDto {
  @ApiPropertyOptional({ description: 'New name for the device' })
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

  @ApiPropertyOptional({
    description: 'Move the device to a different room (room UUID)',
  })
  @IsOptional()
  @IsUUID()
  roomId?: string
}
