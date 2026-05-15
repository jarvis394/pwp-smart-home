import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672'

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [RABBITMQ_URL],
        queue: 'auxiliary_queue',
        queueOptions: {
          durable: true,
        },
      },
    }
  )

  await app.listen()
  Logger.log('Auxiliary service is running')
}

bootstrap()
