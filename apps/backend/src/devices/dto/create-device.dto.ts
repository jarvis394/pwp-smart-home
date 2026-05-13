import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsUUID } from 'class-validator'

// Data Transfer Object (DTO) for creating a new device
export class CreateDeviceDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model?: string

  @ApiProperty()
  @IsString()
  type: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  roomId?: string
}
