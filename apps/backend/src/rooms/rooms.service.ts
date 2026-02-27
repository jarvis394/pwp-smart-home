import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { Database, DrizzleAsyncProvider } from '../db/drizzle.module'
import { eq } from '@smart-home/db'
import { Room, NewRoom, rooms } from '@smart-home/db/schema'

@Injectable()
export class RoomsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database
  ) {}

  async getRooms(apartmentId: string): Promise<Room[]> {
    return await this.db.query.rooms.findMany({
      where: (fields, { eq }) => eq(fields.apartmentId, apartmentId),
    })
  }

  async getById(id: string): Promise<Room> {
    const room = await this.db.query.rooms.findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
    })

    if (!room) throw new NotFoundException('Room not found')
    return room
  }

  async create(data: NewRoom): Promise<Room> {
    const [result] = await this.db.insert(rooms).values(data).returning()

    if (!result) throw new InternalServerErrorException('Failed to create room')
    return result
  }

  async update(
    id: string,
    data: Partial<Omit<NewRoom, 'apartmentId'>>
  ): Promise<Room> {
    const [result] = await this.db
      .update(rooms)
      .set(data)
      .where(eq(rooms.id, id))
      .returning()

    if (!result) throw new NotFoundException('Room not found')
    return result
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.db
      .delete(rooms)
      .where(eq(rooms.id, id))
      .returning()

    if (!result) throw new NotFoundException('Room not found')
    return true
  }
}
