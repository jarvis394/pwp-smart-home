import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateRoomDto {
  @ApiProperty({ example: 'Master Bedroom', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ example: 'Second Floor', required: false })
  @IsString()
  @IsOptional()
  location?: string
}
