import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateApartmentDto {
  @ApiProperty({ description: 'My Home', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ description: 'Helsinki', required: false })
  @IsString()
  @IsOptional()
  location?: string
}
