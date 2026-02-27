import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { NewUser } from '@smart-home/db/schema'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class RegisterDto implements NewUser {
  @ApiProperty({
    description: 'User email',
  })
  @IsEmail({}, { message: 'Email field is invalid' })
  email: string

  @ApiProperty({
    description: 'User password',
  })
  @IsNotEmpty({ message: 'Password field is required' })
  password: string

  @ApiProperty({
    description: 'User first name, or any string',
  })
  @IsNotEmpty({ message: 'Name is required' })
  firstName: string

  @ApiProperty({
    description: 'User last name',
  })
  lastName: string

  @ApiProperty({
    description: 'URL for user avatar',
  })
  @ApiPropertyOptional()
  avatarUrl?: string
}
