import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { AddDeviceReq } from '@smart-home/shared'
import { Device, devices, User } from '@smart-home/db/schema'
import { and, eq } from '@smart-home/db'
import { DrizzleAsyncProvider, Database } from '../db/drizzle.module'

@Injectable()
export class DevicesService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database,
    @Inject('AUXILIARY_SERVICE') private readonly alertsClient: ClientProxy
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
    const device = await this.getDevice(userId, deviceId)

    if (!device) return false

    await this.db
      .delete(devices)
      .where(and(eq(devices.id, deviceId), eq(devices.userId, userId)))

    this.alertsClient.emit('device.deleted', { userId, deviceId })

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

      if (!device) return []

      return await tx
        .update(devices)
        .set({
          favorite: !device.favorite,
        })
        .where(and(eq(devices.id, deviceId), eq(devices.userId, userId)))
        .returning()
    })

    if (result) {
      this.alertsClient.emit('device.favorite.changed', {
        userId,
        deviceId,
        favorite: result.favorite,
      })
    }

    return result?.favorite ?? false
  }

  async addDevice(userId: User['id'], data: AddDeviceReq): Promise<Device> {
    const result = await this.db.transaction(async (tx) => {
      const user = await tx.query.users.findFirst({
        where: (fields, { eq }) => eq(fields.id, userId),
      })

      if (!user) {
        throw new ForbiddenException('User not found')
      }

      if (data.roomId) {
        const roomId = data.roomId
        const room = await tx.query.rooms.findFirst({
          where: (fields, { eq }) => eq(fields.id, roomId),
        })
        if (!room) {
          throw new ForbiddenException('Room not found')
        }
        const apartment = await tx.query.apartments.findFirst({
          where: (fields, { eq, and }) =>
            and(eq(fields.id, room.apartmentId), eq(fields.userId, userId)),
        })
        if (!apartment) {
          throw new ForbiddenException('Room does not belong to user')
        }
      }

      const [inserted] = await tx
        .insert(devices)
        .values({
          userId,
          ...data,
          roomId: data.roomId ?? null,
        })
        .returning()

      return inserted
    })

    if (!result) {
      throw new InternalServerErrorException('Did not insert new device')
    }

    this.alertsClient.emit('device.added', {
      userId,
      deviceId: result.id,
      name: result.name,
    })

    return this.serializeDevice(result)
  }

  async setDeviceState(
    userId: User['id'],
    deviceId: Device['id'],
    on: boolean
  ): Promise<boolean> {
    const device = await this.getDevice(userId, deviceId)
    if (!device?.capabilities.on_off) {
      throw new ForbiddenException('Unsupported device feature')
    }

    device.capabilities.on_off.state.value = on

    await this.updateDevice(userId, deviceId, {
      capabilities: device.capabilities,
    })

    this.alertsClient.emit('device.state.changed', { userId, deviceId, on })

    return on
  }
}
