/**
 * @file DTO for Device Response
 * Data validation of Device properties
 * Uses NestJS Swagger decorators for API documentation properties
 */
import { ApiProperty } from '@nestjs/swagger'
import { DeviceState, DeviceType } from '@smart-home/db'
import { DeviceCapabilitiesDto } from './capabilities.dto'

export class Device {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string

  @ApiProperty({ example: DeviceState.ONLINE, enum: DeviceState })
  state: DeviceState

  @ApiProperty({ type: DeviceCapabilitiesDto })
  capabilities: DeviceCapabilitiesDto

  @ApiProperty({ example: false })
  favorite: boolean

  @ApiProperty({ example: 'Kitchen Light', description: 'Name for device' })
  name: string

  @ApiProperty({
    example: 'Xiaomi TL-45',
    description: 'The specific hardware model',
    required: false,
  })
  model?: string | null

  @ApiProperty({
    example: 'Light',
    enum: DeviceType,
    description: 'type of device (e.g., Light, Sensor, Plug)',
  })
  type: DeviceType

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'The ID of the room where this device is located',
    required: false,
  })
  roomId?: string | null
}
