import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class TokenResponse {
  @ApiProperty({ example: 'eyJhbGci...', description: 'JWT Access Token' })
  @IsString()
  @IsNotEmpty()
  accessToken: string

  @ApiProperty({ example: 'eyJhbGci...', description: 'JWT Refresh Token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string
}
