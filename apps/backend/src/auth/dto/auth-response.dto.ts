import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

// Data Transfer Object (DTO) for authentication response containing access and refresh tokens
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
