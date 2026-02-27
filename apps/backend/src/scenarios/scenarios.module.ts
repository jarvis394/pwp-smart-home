import { Module } from '@nestjs/common'
import { ScenariosService } from './scenarios.service'
import { ScenariosController } from './scenarios.controller'
import { DrizzleModule } from '../db/drizzle.module'

@Module({
  imports: [DrizzleModule],
  controllers: [ScenariosController],
  providers: [ScenariosService],
  exports: [ScenariosService],
})
export class ScenariosModule {}
