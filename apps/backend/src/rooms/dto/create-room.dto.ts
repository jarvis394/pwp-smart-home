import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateRoomDto {
  @ApiProperty({ example: 'Kitchen', description: 'Name of the room' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'Basement', description: 'Location of the room' })
  @IsString()
  @IsNotEmpty()
  location: string
}
