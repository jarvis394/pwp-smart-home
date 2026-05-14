import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class AlertsService {
  private readonly logger = new Logger('AuxiliaryService')
  private readonly logFile = path.join(process.cwd(), 'alerts.log')

  private write(message: string) {
    const timestamp = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)
    const line = `[${timestamp}] ${message}\n`
    this.logger.log(message)
    fs.appendFileSync(this.logFile, line, { encoding: 'utf8' })
  }

  logStateChanged(userId: string, deviceId: string, on: boolean) {
    this.write(
      `DEVICE STATE CHANGED - Device: ${deviceId} | User: ${userId} | State: ${
        on ? 'ON' : 'OFF'
      }`
    )
  }

  logFavoriteChanged(userId: string, deviceId: string, favorite: boolean) {
    this.write(
      `FAVORITE TOGGLED - Device: ${deviceId} | User: ${userId} | Favorite: ${favorite}`
    )
  }

  logDeviceAdded(userId: string, deviceId: string, name: string) {
    this.write(
      `DEVICE ADDED - Device: "${name}" (${deviceId}) | User: ${userId}`
    )
  }

  logDeviceDeleted(userId: string, deviceId: string) {
    this.write(`DEVICE DELETED - Device ID: ${deviceId} | User: ${userId}`)
  }
}
