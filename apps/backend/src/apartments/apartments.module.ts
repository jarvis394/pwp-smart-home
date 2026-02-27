import { Module } from '@nestjs/common'
import { ApartmentsService } from './apartments.service'
import { ApartmentsController } from './apartments.controller'
import { DrizzleModule } from '../db/drizzle.module'

@Module({
  imports: [DrizzleModule],
  controllers: [ApartmentsController],
  providers: [ApartmentsService],
  exports: [ApartmentsService],
})
export class ApartmentsModule {}
