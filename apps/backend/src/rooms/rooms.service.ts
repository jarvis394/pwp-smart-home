import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common'
import { Database, DrizzleAsyncProvider } from '../db/drizzle.module'
import { eq, and } from '@smart-home/db'
import { Room, NewRoom, rooms, apartments } from '@smart-home/db/schema'

// Service for managing rooms within user apartments, including business logic for
// CRUD operations and ensuring proper ownership and error handling
@Injectable()
export class RoomsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database
  ) {}

  // Helper method to verify that a given apartment belongs to the specified user,
  // throwing a ForbiddenException if the check fails
  private async verifyApartmentOwnership(
    apartmentId: string,
    userId: string
  ): Promise<void> {
    const apartment = await this.db.query.apartments.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, apartmentId), eq(fields.userId, userId)),
    })
    if (!apartment) {
      throw new ForbiddenException('Apartment does not belong to this user')
    }
  }

  // Method to retrieve rooms for a user, with optional filtering by
  // apartment ID and location, and ensuring that only rooms belonging to the
  // user's apartments are returned
  async getRooms(
    userId: string,
    filters?: { apartmentId?: string; location?: string }
  ): Promise<Room[]> {
    const conditions = []

    if (filters?.apartmentId) {
      conditions.push(eq(rooms.apartmentId, filters.apartmentId))
    }
    if (filters?.location) {
      conditions.push(eq(apartments.location, filters.location))
    }

    const baseCondition = eq(apartments.userId, userId)

    const whereClause =
      conditions.length > 0 ? and(baseCondition, ...conditions) : baseCondition

    const rows = await this.db
      .select({
        id: rooms.id,
        name: rooms.name,
        location: rooms.location,
        apartmentId: rooms.apartmentId,
      })
      .from(rooms)
      .innerJoin(apartments, eq(rooms.apartmentId, apartments.id))
      .where(whereClause)

    return rows
  }

  // Method to retrieve a single room by its ID for a user, ensuring that the room
  // exists and belongs to one of the user's apartments, with appropriate error handling
  async getById(userId: string, roomId: string): Promise<Room> {
    const room = await this.db.query.rooms.findFirst({
      where: (fields, { eq }) => eq(fields.id, roomId),
    })
    if (!room) throw new NotFoundException('Room not found')

    await this.verifyApartmentOwnership(room.apartmentId, userId)
    return room
  }

  // Method to create a new room for a user within a specified apartment,
  // ensuring that the apartment belongs to the user, and handling potential errors
  // during creation
  async create(
    userId: string,
    apartmentId: string,
    data: Omit<NewRoom, 'apartmentId'>
  ): Promise<Room> {
    await this.verifyApartmentOwnership(apartmentId, userId)

    const [result] = await this.db
      .insert(rooms)
      .values({ ...data, apartmentId })
      .returning()

    if (!result) throw new InternalServerErrorException('Failed to create room')
    return result
  }

  // Method to update an existing room's details, allowing partial updates,
  // ensuring that the room exists and belongs to the user's apartment, and
  // handling potential errors during the update process
  async update(
    userId: string,
    roomId: string,
    data: Partial<Omit<NewRoom, 'apartmentId'>>
  ): Promise<Room> {
    const room = await this.db.query.rooms.findFirst({
      where: (fields, { eq }) => eq(fields.id, roomId),
    })
    if (!room) throw new NotFoundException('Room not found')

    await this.verifyApartmentOwnership(room.apartmentId, userId)

    const [result] = await this.db
      .update(rooms)
      .set(data)
      .where(eq(rooms.id, roomId))
      .returning()

    if (!result) throw new InternalServerErrorException('Failed to update room')
    return result
  }

  // Method to delete a room by its ID for a user, ensuring that the room exists
  // and belongs to the user's apartment, and handling potential errors
  // during the deletion process
  async delete(userId: string, roomId: string): Promise<boolean> {
    const room = await this.db.query.rooms.findFirst({
      where: (fields, { eq }) => eq(fields.id, roomId),
    })
    if (!room) throw new NotFoundException('Room not found')

    await this.verifyApartmentOwnership(room.apartmentId, userId)

    await this.db.delete(rooms).where(eq(rooms.id, roomId))
    return true
  }
}
