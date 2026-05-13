import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateApartmentDto {
  @ApiProperty({ description: 'Name of an apartment', example: 'My Home' })
  @IsString()
  @IsNotEmpty({ message: 'Apartment name or alias' })
  name: string

  @ApiProperty({
    description: 'City/area where the apartment is located',
    example: 'Oulu',
  })
  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string
}
