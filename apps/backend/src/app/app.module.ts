import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
// import * as schema from '@smart-home/db/schema'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
// import { ConfigService } from '../config/config.service'
import { ConfigModule } from '../config/config.module'
import { DevicesModule } from '../devices/devices.module'
import { ApartmentsModule } from '../apartments/apartments.module'
// import { DrizzleModule, DrizzleModuleOptions } from '@sixaphone/nestjs-drizzle'
// import { type Table } from 'drizzle-orm'

// const schemasRecord: Record<string, Table> = {
//   users: schema.users,
//   apartments: schema.apartments,
//   devices: schema.devices,
//   rooms: schema.rooms,
//   scenarios: schema.scenarios,
// }

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // DrizzleModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => {
    //     return {
    //       type: 'postgres',
    //       url: configService.POSTGRES_URL,
    //       schema: schemasRecord,
    //     } as unknown as DrizzleModuleOptions
    //   },
    //   imports: [ConfigModule],
    //   inject: [ConfigModule],
    // }),
    UserModule,
    DevicesModule,
    AuthModule,
    ApartmentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
