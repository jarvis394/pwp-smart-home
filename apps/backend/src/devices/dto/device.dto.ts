import { ApiProperty } from '@nestjs/swagger'

export class Device{
    @ApiProperty({ example: 'dev-001' })
    id: string

    @ApiProperty({ example: 'Living Room Light' })
    name: string

    @ApiProperty({ example: 'Light' })
    type: string

    @ApiProperty({ example: false })
    favorite: boolean
}
