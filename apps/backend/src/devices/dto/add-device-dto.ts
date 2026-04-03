import { ApiProperty } from '@nestjs/swagger'

export class CreateDeviceReq{
    @ApiProperty({ example: 'Kitchen Light', description: 'Name for device' })
    name: string

    @ApiProperty({ example: 'Xiaomi TL-45', description: 'The specific hardware model' })
    model: string

    @ApiProperty({ example: 'Light' , description: 'type of device (e.g., Light, Sensor, Plug)'})
    type: string

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'The ID of the apartment where this device is located' })
    apartmentId: string
}
