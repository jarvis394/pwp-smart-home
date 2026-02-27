import { ApiProperty } from '@nestjs/swagger'
import { User } from '@smart-home/db/schema'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class LoginDto implements Pick<User, 'email' | 'password'> {
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
}
