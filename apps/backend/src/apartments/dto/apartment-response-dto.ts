/**
 * @file DTO for Apartment Response
 * Data validation of Apartment properties
 * Uses NestJS Swagger decorators for API documentation properties
 */
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class Apartment {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'Unique identifier for apartment',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'My Home', description: 'Name of the apartment' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'Oulu', description: 'Location of the apartment' })
  @IsString()
  @IsNotEmpty()
  location: string
}
