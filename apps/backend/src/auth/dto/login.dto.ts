import { ApiProperty } from '@nestjs/swagger'
import { User } from '@smart-home/db/schema'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class LoginDto implements Pick<User, 'email' | 'password'> {
  @ApiProperty({
    description: 'User email',
    example: 'dl3@test.com'
  })
  @IsEmail({}, { message: 'Email field is invalid' })
  email: string

  @ApiProperty({
    description: 'User password',
    example: 'dl3test123'
  })
  @IsNotEmpty({ message: 'Password field is required' })
  password: string
}
