import { Module } from '@nestjs/common'
import { DevicesService } from './devices.service'
import { DevicesController } from './devices.controller'
import { UserFavoritesController } from './favorites.controller'
import { ConfigService } from '../config/config.service'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'

@Module({
  imports: [],
  providers: [
    DevicesService,
    ConfigService,
    {
      provide: 'DEVICES_SERVICE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [config.RABBITMQ_URL],
            queue: 'devices_service_queue',
            queueOptions: {
              durable: true,
            },
          },
        })
      },
    },
  ],
  controllers: [DevicesController, UserFavoritesController],
})
export class DevicesModule {}
