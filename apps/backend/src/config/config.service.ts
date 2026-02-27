import { Injectable } from '@nestjs/common'
import { ConfigService as BaseConfigService } from '@nestjs/config'
import { path as rootPath } from 'app-root-path'
import path from 'path'

type EnvSchema = {
  PORT: string
  POSTGRES_URL: string
  JWT_KEY: string
  JWT_ACCESS_TOKEN_TTL: string
  JWT_REFRESH_TOKEN_TTL: string
  RABBITMQ_URL: string
}

@Injectable()
export class ConfigService {
  constructor(private configService: BaseConfigService<EnvSchema>) {}

  get PORT() {
    return this.configService.get('PORT') || 5000
  }

  get POSTGRES_URL() {
    return this.configService.getOrThrow('POSTGRES_URL')
  }

  get RABBITMQ_URL() {
    return this.configService.getOrThrow('RABBITMQ_URL')
  }

  get UPLOADS_QUALITY() {
    return 70
  }

  get UPLOADS_PATH() {
    return path.join(rootPath, 'uploads')
  }

  get JWT_KEY() {
    return this.configService.getOrThrow('JWT_KEY')
  }

  get JWT_ACCESS_TOKEN_TTL() {
    return this.configService.get('JWT_ACCESS_TOKEN_TTL') || '60m'
  }

  get JWT_REFRESH_TOKEN_TTL() {
    return this.configService.get('JWT_REFRESH_TOKEN_TTL') || '30d'
  }
}
