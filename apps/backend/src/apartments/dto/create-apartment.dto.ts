import { ApiProperty } from '@nestjs/swagger'
import { isNotEmpty, IsNotEmpty, IsString } from 'class-validator'

export class CreateApartmentDto {
  @ApiProperty({ description: 'My Home' })
  @IsString()
  @IsNotEmpty({ message: 'Apartment name or alias' })
  name: string

  @ApiProperty({ description: 'Helsinki' })
  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string
}
