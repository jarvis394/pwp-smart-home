import { ApiProperty } from '@nestjs/swagger'
import { IsObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { DeviceCapabilitiesDto } from './capabilities.dto'

export class UpdateDeviceStateDto {
  @ApiProperty({ type: DeviceCapabilitiesDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceCapabilitiesDto)
  capabilities: DeviceCapabilitiesDto
}
