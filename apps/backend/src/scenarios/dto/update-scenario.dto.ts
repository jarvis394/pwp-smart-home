import { ApiProperty } from '@nestjs/swagger'

export class UpdateScenarioDto {
  @ApiProperty({ example: 'Morning Routine', required: false })
  name?: string

  @ApiProperty({ example: [], required: false })
  actions?: object
}
