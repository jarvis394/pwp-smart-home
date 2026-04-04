import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsNotEmpty,
  IsArray,
  IsString,
  IsUUID,
} from 'class-validator'

export class Scenario {
  @ApiProperty({
    example: 'scen-001',
    description: 'Unique identifier for Scenario',
  })
  @IsString()
  @IsNotEmpty()
  id: string

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
