import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreateRoomDto {
  @ApiProperty({ example: 'Kitchen', description: 'Name of the room' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'Basement', description: 'Location of the room' })
  @IsString()
  @IsNotEmpty()
  location: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Unique identifier for room' })
  @IsUUID()
  @IsNotEmpty()
  apartmentId: string
}
