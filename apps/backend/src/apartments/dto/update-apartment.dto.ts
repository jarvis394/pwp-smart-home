import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

// Data Transfer Object (DTO) for updating an existing apartment
export class UpdateApartmentDto {
  @ApiProperty({
    description: 'Name of an apartment',
    example: 'New Home',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({
    description: 'City/area where the apartment is located',
    example: 'Helsinki',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string
}
