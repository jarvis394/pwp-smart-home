import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateRoomDto {
  @ApiProperty({ example: 'Living Room', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ example: 'First Floor', required: false })
  @IsString()
  @IsOptional()
  location?: string
}
