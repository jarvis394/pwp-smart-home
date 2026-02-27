import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule } from '../config/config.module'
import { DevicesModule } from '../devices/devices.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DevicesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
