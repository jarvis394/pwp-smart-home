import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as path from 'path'

@Injectable()
export class AlertsService {
  private readonly logger = new Logger('AuxiliaryService')
  private readonly logFile = path.join(process.cwd(), 'alerts.log')

  private async write(message: string) {
    const timestamp = new Date()
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)
    const line = `[${timestamp}] ${message}\n`
    this.logger.log(message)
    try {
      await fs.appendFile(this.logFile, line, { encoding: 'utf8' })
    } catch (err) {
      this.logger.warn(`Failed to write to log file: ${err}`)
    }
  }

  logStateChanged(userId: string, deviceId: string, on: boolean) {
    void this.write(
      `DEVICE STATE CHANGED - Device: ${deviceId} | User: ${userId} | State: ${
        on ? 'ON' : 'OFF'
      }`
    )
  }

  logFavoriteChanged(userId: string, deviceId: string, favorite: boolean) {
    void this.write(
      `FAVORITE TOGGLED - Device: ${deviceId} | User: ${userId} | Favorite: ${favorite}`
    )
  }

  logDeviceAdded(userId: string, deviceId: string, name: string) {
    void this.write(
      `DEVICE ADDED - Device: "${name}" (${deviceId}) | User: ${userId}`
    )
  }

  logDeviceDeleted(userId: string, deviceId: string) {
    void this.write(`DEVICE DELETED - Device ID: ${deviceId} | User: ${userId}`)
  }
}
