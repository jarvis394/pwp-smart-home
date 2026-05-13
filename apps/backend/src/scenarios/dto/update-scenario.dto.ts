import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString } from 'class-validator'

// Data Transfer Object (DTO) for updating an existing scenario, allowing optional
// fields for partial updates, including validation and API documentation metadata
export class UpdateScenarioDto {
  @ApiProperty({
    description: 'Updated name of scenario',
    example: 'Morning Routine',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({
    description: 'Updated list of actions for this scenario',
    type: 'array',
    items: { type: 'object' },
    example: [
      {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        lightIntensity: 'dim',
      },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  actions?: object[]
}
