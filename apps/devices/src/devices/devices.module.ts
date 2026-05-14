import { Module } from '@nestjs/common'
import { DevicesService } from './devices.service'
import { DevicesController } from './devices.controller'
import { ConfigService } from '../config/config.service'
import { DrizzleModule } from '../db/drizzle.module'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'

@Module({
  imports: [DrizzleModule],
  providers: [
    DevicesService,
    ConfigService,
    {
      provide: 'AUXILIARY_SERVICE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [config.RABBITMQ_URL],
            queue: 'auxiliary_queue',
            queueOptions: {
              durable: true,
            },
          },
        })
      },
    },
  ],
  controllers: [DevicesController],
})
export class DevicesModule {}
