/**
 * @file Module for Devices resource
 * Configures RabbitMQ microservice credentials under the Auxiliary Client provider
 * Links devices controller and service together with the Drizzle database module
 */
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
