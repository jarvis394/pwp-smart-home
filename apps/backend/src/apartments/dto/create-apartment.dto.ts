import { ApiProperty } from '@nestjs/swagger'

export class CreateApartmentDto {
  @ApiProperty({ example: 'My Home' })
  name: string

  @ApiProperty({ example: 'Helsinki' })
  location: string
}
