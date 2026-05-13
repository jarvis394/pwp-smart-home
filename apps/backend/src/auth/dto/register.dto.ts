import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { NewUser } from '@smart-home/db/schema'
import { IsEmail, IsNotEmpty } from 'class-validator'

// Data Transfer Object (DTO) for user registration, containing email, password, first name, last name, and optional avatar URL
export class RegisterDto implements NewUser {
  @ApiProperty({
    description: 'User email',
    example: 'dl3@test.com',
  })
  @IsEmail({}, { message: 'Email field is invalid' })
  email: string

  @ApiProperty({
    description: 'User password',
    example: 'dl3test123',
  })
  @IsNotEmpty({ message: 'Password field is required' })
  password: string

  @ApiProperty({
    description: 'User first name, or any string',
    example: 'John',
  })
  @IsNotEmpty({ message: 'Name is required' })
  firstName: string

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string

  @ApiProperty({
    description: 'URL for user avatar',
    example: 'http://example.com/avatar.png',
  })
  @ApiPropertyOptional()
  avatarUrl?: string
}
