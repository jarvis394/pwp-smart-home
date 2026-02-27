import { ApiProperty } from '@nestjs/swagger'

export class CreateScenarioDto {
  @ApiProperty({ example: 'Morning Routine' })
  name: string

  @ApiProperty({ example: [] })
  actions: object
}
