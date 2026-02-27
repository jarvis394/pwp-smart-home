import { Module } from '@nestjs/common'
import { DevicesService } from './devices.service'
import { DevicesController } from './devices.controller'
import { ConfigService } from '../config/config.service'
import { DrizzleModule } from '../db/drizzle.module'

@Module({
  imports: [DrizzleModule],
  providers: [DevicesService, ConfigService],
  controllers: [DevicesController],
})
export class DevicesModule {}
