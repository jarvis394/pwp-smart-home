import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsArray, IsString } from 'class-validator'

// Data Transfer Object (DTO) representing a scenario, including its properties and
// metadata for API documentation
export class Scenario {
  @ApiProperty({
    example: 'scen-001',
    description: 'Unique identifier for Scenario',
  })
  @IsString()
  @IsNotEmpty()
  id: string

  // Unique identifier for the apartment to which the scenario belongs,
  // ensuring that scenarios are associated with specific user apartments
  @ApiProperty({
    description: 'Name of the scenario',
    example: 'Morning Routine',
  })
  @IsString()
  @IsNotEmpty({ message: 'Scenario name is required' })
  name: string

  @ApiProperty({
    description: 'Displays if scenario is active or not',
    example: true,
  })
  @IsBoolean()
  isActive: boolean

  @ApiProperty({
    description: 'Actions to perform in this scenario',
    example: [
      {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        lightIntensity: 'bright',
      },
    ],
    type: 'array',
    items: { type: 'object' },
  })
  @IsArray()
  actions: object[]
}
