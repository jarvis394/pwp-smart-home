import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsString } from 'class-validator'

export class CreateScenarioDto {
  @ApiProperty({ description: 'Morning Routine' })
  @IsString()
  @IsNotEmpty({ message: 'Scenario name is required' })
  name: string

  @ApiProperty({ description: 'Actions to perform in this scenario' })
  @IsObject()
  actions: object
}
