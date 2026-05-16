/**
 * @file Module for Scenarios resource
 * Links scenarios controller and service with the Drizzle database module
 * Exports the service so other modules can use it
 */
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
