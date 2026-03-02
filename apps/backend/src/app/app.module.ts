import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '../config/config.module'
import { DevicesModule } from '../devices/devices.module'
import { ApartmentsModule } from '../apartments/apartments.module'
import { RoomsModule } from '../rooms/rooms.module'
import { ScenariosModule } from '../scenarios/scenarios.module'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigService } from '../config/config.service'
import KeyvRedis from '@keyv/redis'
import { Keyv } from 'keyv'
import { CacheableMemory } from 'cacheable'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.REDIS_URL
        const store = redisUrl
          ? new KeyvRedis(redisUrl)
          : new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            })

        return {
          stores: [store],
        }
      },
    }),
    UserModule,
    DevicesModule,
    AuthModule,
    ApartmentsModule,
    RoomsModule,
    ScenariosModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
