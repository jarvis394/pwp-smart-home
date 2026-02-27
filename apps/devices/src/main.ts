import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [RABBITMQ_URL],
        queue: 'devices_service_queue',
        queueOptions: {
          durable: false,
        },
      },
    }
  )

  await app.listen()
  Logger.log('🚀 Devices service is running')
}

bootstrap()
