import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { ConfigService } from './config/config.service'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService)
  const globalPrefix = 'api'

  app.setGlobalPrefix(globalPrefix)
  app.useGlobalPipes(new ValidationPipe())
  app.useStaticAssets(config.UPLOADS_PATH, {
    index: false,
    prefix: `/${globalPrefix}/uploads/`,
  })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('smart-home')
    .setDescription('Smart home application')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('user')
    .addTag('devices')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  })
  SwaggerModule.setup('api', app, document)

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.RABBITMQ_URL],
      queue: 'main_app_queue',
      queueOptions: {
        durable: false,
      },
    },
  })

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
  await app.listen(config.PORT)
  Logger.log(
    `🚀 Application is running on: http://localhost:${config.PORT}/${globalPrefix}`
  )
}

bootstrap()
