/**
 * @file Controller for handling device event alerts
 * Listens to microservice event patterns like device state and favorite changes
 * Passes the event over to AlertsService to log current event patterns
 */
import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { AlertsService } from './alerts.service'

@Controller()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @EventPattern('device.state.changed')
  handleStateChanged(
    @Payload() data: { userId: string; deviceId: string; on: boolean }
  ) {
    this.alertsService.logStateChanged(data.userId, data.deviceId, data.on)
  }

  @EventPattern('device.favorite.changed')
  handleFavoriteChanged(
    @Payload() data: { userId: string; deviceId: string; favorite: boolean }
  ) {
    this.alertsService.logFavoriteChanged(
      data.userId,
      data.deviceId,
      data.favorite
    )
  }

  @EventPattern('device.added')
  handleDeviceAdded(
    @Payload() data: { userId: string; deviceId: string; name: string }
  ) {
    this.alertsService.logDeviceAdded(data.userId, data.deviceId, data.name)
  }

  @EventPattern('device.deleted')
  handleDeviceDeleted(@Payload() data: { userId: string; deviceId: string }) {
    this.alertsService.logDeviceDeleted(data.userId, data.deviceId)
  }
}
