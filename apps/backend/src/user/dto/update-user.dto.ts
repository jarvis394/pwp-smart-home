import { IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { UserUpdateReq } from '@smart-home/shared'

// Data Transfer Object (DTO) for updating user information, allowing optional fields
// for partial updates and including metadata for API documentation
export class UpdateUserDto implements Partial<UserUpdateReq> {
  @ApiPropertyOptional({
    description: 'First name of the user',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string

  @ApiPropertyOptional({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string
}
