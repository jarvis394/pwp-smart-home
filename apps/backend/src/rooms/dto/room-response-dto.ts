import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

// Data Transfer Object (DTO) representing a room,
// including its properties and metadata for API documentation
export class Room {
  @ApiProperty({
    example: 'room-001',
    description: 'Unique identifier for room',
  })
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'Living Room', description: 'Name of the room' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'First Floor', description: 'Location of the room' })
  @IsString()
  @IsNotEmpty()
  location: string

  @ApiProperty({
    example: 'apt-111',
    description: 'Unique identifier for apartment assigned',
  })
  @IsString()
  @IsNotEmpty()
  apartmentId: string
}
