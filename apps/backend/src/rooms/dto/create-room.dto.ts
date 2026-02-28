import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateRoomDto {
  @ApiProperty({ description: 'Living Room' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string

  @ApiProperty({ description: 'First Floor' })
  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string

  @ApiProperty({ description: 'apartment-id-here' })
  @IsString()
  @IsNotEmpty({ message: 'Apartment ID is required' })
  apartmentId: string
}
