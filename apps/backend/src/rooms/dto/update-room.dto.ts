/**
 * @file DTO for Update Rooms
 * Data validation reinforcement when user updates a room
 */
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateRoomDto {
  @ApiProperty({ example: 'Master Bedroom', required: false })
  @IsString()
  @IsOptional()
  name?: string
}
