/**
 * @file Module for alerts feature context
 * Binds the alerts controller and service dependencies together
 */
import { Module } from '@nestjs/common'
import { AlertsController } from './alerts.controller'
import { AlertsService } from './alerts.service'

@Module({
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
