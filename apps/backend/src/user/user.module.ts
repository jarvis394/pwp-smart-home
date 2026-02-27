import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { ConfigService } from '../config/config.service'
import { DrizzleModule } from '../db/drizzle.module'

@Module({
  imports: [DrizzleModule],
  controllers: [UserController],
  providers: [UserService, ConfigService],
  exports: [UserService],
})
export class UserModule {}
