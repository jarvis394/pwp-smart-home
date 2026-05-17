/**
 * @file DTO for Device Capabilities
 * Data validation of device capabilities types and properties
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsNumber,
} from 'class-validator'
import { Type } from 'class-transformer'
import { DeviceCapabilityType } from '@smart-home/db'

/**
 * Validates color values based on instance
 * Supports HSV and temperature in Kelvin
 */
export function IsColorSettingValue(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isColorSettingValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>
          if (!obj) return false

          // { instance: 'hsv', value: { h: number, s: number, v: number } }
          if (obj.instance === 'hsv') {
            const val = value as Record<string, unknown>
            return (
              typeof val === 'object' &&
              val !== null &&
              typeof val.h === 'number' &&
              typeof val.s === 'number' &&
              typeof val.v === 'number'
            )
          }

          // { instance: 'temperature_k', value: number }
          if (obj.instance === 'temperature_k') {
            return typeof value === 'number'
          }

          return false
        },
        defaultMessage() {
          return 'value is invalid'
        },
      },
    })
  }
}

export class ColorSettingHsvValueDto {
  @ApiProperty({ example: 20 })
  @IsNumber()
  h: number

  @ApiProperty({ example: 0.5 })
  @IsNumber()
  s: number

  @ApiProperty({ example: 50 })
  @IsNumber()
  v: number
}

export class ColorSettingStateDto {
  @ApiProperty({ enum: ['hsv', 'temperature_k'], example: 'hsv' })
  @IsString()
  instance: 'hsv' | 'temperature_k'

  @ApiProperty({
    oneOf: [
      { type: 'number', example: 4500 },
      { $ref: '#/components/schemas/ColorSettingHsvValueDto' },
    ],
  })
  @IsColorSettingValue()
  value: ColorSettingHsvValueDto | number
}

export class DeviceCapabilityColorSettingDto {
  @ApiProperty({
    enum: DeviceCapabilityType,
    example: DeviceCapabilityType.COLOR_SETTING,
  })
  @IsEnum(DeviceCapabilityType)
  type: DeviceCapabilityType.COLOR_SETTING

  @ApiProperty({ type: ColorSettingStateDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ColorSettingStateDto)
  state: ColorSettingStateDto
}

export class OnOffStateDto {
  @ApiProperty({ example: 'on' })
  @IsString()
  instance: 'on'

  @ApiProperty({ example: true })
  @IsBoolean()
  value: boolean
}

export class DeviceCapabilityOnOffDto {
  @ApiProperty({
    enum: DeviceCapabilityType,
    example: DeviceCapabilityType.ON_OFF,
  })
  @IsEnum(DeviceCapabilityType)
  type: DeviceCapabilityType.ON_OFF

  @ApiProperty({ type: OnOffStateDto })
  @IsObject()
  @ValidateNested()
  @Type(() => OnOffStateDto)
  state: OnOffStateDto
}

export class VideoStreamStateValueDto {
  @ApiProperty({ example: 'https://example.com/stream.m3u8' })
  @IsString()
  streamUrl: string

  @ApiProperty({ enum: ['hls', 'mp4'], example: 'hls' })
  @IsEnum(['hls', 'mp4'])
  protocol: 'hls' | 'mp4'
}

export class VideoStreamStateDto {
  @ApiProperty({ example: 'get_stream' })
  @IsString()
  instance: 'get_stream'

  @ApiProperty({ type: VideoStreamStateValueDto })
  @IsObject()
  @ValidateNested()
  @Type(() => VideoStreamStateValueDto)
  value: VideoStreamStateValueDto
}

export class DeviceCapabilityVideoStreamDto {
  @ApiProperty({
    enum: DeviceCapabilityType,
    example: DeviceCapabilityType.VIDEO_STREAM,
  })
  @IsEnum(DeviceCapabilityType)
  type: DeviceCapabilityType.VIDEO_STREAM

  @ApiProperty({ type: VideoStreamStateDto })
  @IsObject()
  @ValidateNested()
  @Type(() => VideoStreamStateDto)
  state: VideoStreamStateDto
}

export class DeviceCapabilitiesDto {
  @ApiPropertyOptional({ type: DeviceCapabilityOnOffDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceCapabilityOnOffDto)
  on_off?: DeviceCapabilityOnOffDto

  @ApiPropertyOptional({ type: DeviceCapabilityVideoStreamDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceCapabilityVideoStreamDto)
  video_stream?: DeviceCapabilityVideoStreamDto

  @ApiPropertyOptional({ type: DeviceCapabilityColorSettingDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceCapabilityColorSettingDto)
  color_setting?: DeviceCapabilityColorSettingDto

  @ApiPropertyOptional({ example: {} })
  @IsOptional()
  @IsObject()
  range?: Record<string, unknown>
}
