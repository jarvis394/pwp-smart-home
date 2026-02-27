import { ApiProperty } from '@nestjs/swagger'

export class CreateRoomDto {
  @ApiProperty({ example: 'Living Room' })
  name: string

  @ApiProperty({ example: 'First Floor' })
  location: string

  @ApiProperty({ example: 'apartment-id-here' })
  apartmentId: string
}
