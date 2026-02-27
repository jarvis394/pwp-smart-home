import { ApiProperty } from '@nestjs/swagger'

export class UpdateApartmentDto {
  @ApiProperty({ example: 'My Home', required: false })
  name?: string

  @ApiProperty({ example: 'Helsinki', required: false })
  location?: string
}
