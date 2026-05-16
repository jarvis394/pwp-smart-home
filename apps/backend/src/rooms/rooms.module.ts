/**
 * @file Module for Rooms resource
 * Links rooms controller and service with the Drizzle database module
 * Exports the service so other modules can use it
 */
import { Module } from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { RoomsController } from './rooms.controller'
import { DrizzleModule } from '../db/drizzle.module'

@Module({
  imports: [DrizzleModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
