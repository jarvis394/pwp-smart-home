/**
 * @file DTO for Create Scenario
 * Data validation reinforcement when user registers new scenario
 */
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsArray, IsString } from 'class-validator'

export class CreateScenarioDto {
  @ApiProperty({ description: 'Name of the scenario', example: 'Movie Night' })
  @IsString()
  @IsNotEmpty({ message: 'Scenario name is required' })
  name: string

  @ApiProperty({
    description: 'Actions to perform in this scenario',
    type: 'array',
    items: { type: 'object' },
    example: [
      {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        lightIntensity: 'dim',
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  actions: object[]
}
