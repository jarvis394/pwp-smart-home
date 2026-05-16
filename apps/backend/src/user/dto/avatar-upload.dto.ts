/**
 * @file DTO for Avatar Upload
 * Data validation of Avatar properties
 * Uses NestJS Swagger decorators for API documentation properties
 */
import { ApiProperty } from '@nestjs/swagger'

class AvatarUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload',
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: any
}

export default AvatarUploadDto
