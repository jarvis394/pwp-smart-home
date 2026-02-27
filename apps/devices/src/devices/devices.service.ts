import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { AddDeviceReq } from '@smart-home/shared'
import { Device, devices, User } from '@smart-home/db/schema'
import { and, eq } from '@smart-home/db'
import { DrizzleAsyncProvider, Database } from '../db/drizzle.module'

@Injectable()
export class DevicesService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database
  ) {}

  serializeDevice(deviceDocument: Device): Device {
    return {
      id: deviceDocument.id,
      userId: deviceDocument.userId,
      capabilities: deviceDocument.capabilities,
      favorite: deviceDocument.favorite,
      name: deviceDocument.name,
      state: deviceDocument.state,
      type: deviceDocument.type,
      model: deviceDocument.model,
      roomId: deviceDocument.roomId,
    }
  }

  async getDevices(userId: User['id']): Promise<Device[]> {
    const devices = await this.db.query.devices.findMany({
      where: (fields, { eq }) => eq(fields.userId, userId),
    })
    return devices.map((device) => this.serializeDevice(device))
  }

  async getDevice(
    userId: User['id'],
    deviceId: Device['id']
  ): Promise<Device | undefined> {
    const device = await this.db.query.devices.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.userId, userId), eq(fields.id, deviceId)),
    })
    return device
  }

  async updateDevice(
    userId: User['id'],
    deviceId: Device['id'],
    data: Partial<Device>
  ): Promise<Device | undefined> {
    const [device] = await this.db
      .update(devices)
      .set(data)
      .where(and(eq(devices.userId, userId), eq(devices.id, deviceId)))
      .returning()
    return device
  }

  async getFavoriteDevices(userId: User['id']): Promise<Device[]> {
    const devices = await this.db.query.devices.findMany({
      where: (fields, { eq, and }) =>
        and(eq(fields.userId, userId), eq(fields.favorite, true)),
    })
    return devices.map((device) => this.serializeDevice(device))
  }

  async delete(userId: User['id'], deviceId: Device['id']): Promise<boolean> {
    await this.db
      .delete(devices)
      .where(and(eq(devices.id, deviceId), eq(devices.userId, userId)))
    return true
  }

  async toggleFavorite(
    userId: User['id'],
    deviceId: Device['id']
  ): Promise<boolean> {
    const [result] = await this.db.transaction(async (tx) => {
      const device = await tx.query.devices.findFirst({
        where: (fields, { eq, and }) =>
          and(eq(fields.id, deviceId), eq(fields.userId, userId)),
      })
      return await tx
        .update(devices)
        .set({
          favorite: !device?.favorite,
        })
        .returning()
    })

    return !result?.favorite || false
  }

  async toggleOnOff(
    userId: User['id'],
    deviceId: Device['id']
  ): Promise<boolean> {
    const result = await this.getDevice(userId, deviceId)
    if (!result?.capabilities.on_off) {
      throw new ForbiddenException('Unsupported device feature')
    }

    result.capabilities.on_off.state.value =
      !result.capabilities.on_off.state.value

    await this.updateDevice(userId, deviceId, {
      capabilities: result.capabilities,
    })

    return result.capabilities.on_off.state.value
  }

  async addDevice(userId: User['id'], data: AddDeviceReq): Promise<Device> {
    const [result] = await this.db
      .insert(devices)
      .values({
        userId,
        ...data,
      })
      .returning()

    if (!result) {
      throw new InternalServerErrorException('Did not insert new device')
    }

    return this.serializeDevice(result)
  }
}
