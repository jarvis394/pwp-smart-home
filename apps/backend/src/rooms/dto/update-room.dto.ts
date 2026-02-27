import { ApiProperty } from '@nestjs/swagger'

export class UpdateRoomDto {
  @ApiProperty({ example: 'Living Room', required: false })
  name?: string

  @ApiProperty({ example: 'First Floor', required: false })
  location?: string
}
