/**
 * @file DTO for User Response
 * Data validation of User properties
 * Uses NestJS Swagger decorators for API documentation properties
 */
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, IsUrl, IsOptional } from 'class-validator'

export class UserResponseDto {
  @ApiProperty({
    example: 'uuid-123-456',
    description: 'Unique identifier for the user',
  })
  @IsString()
  userId: string

  @ApiProperty({ example: 'd13@test.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string

  @ApiProperty({
    example: 'http://example.com/storage/avatar.png',
    description: 'URL to the user avatar image',
  })
  @IsUrl()
  @IsOptional()
  avatarUrl: string
}
