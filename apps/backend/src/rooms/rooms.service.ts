/**
 * @file Services for handling Room resources
 * In charge of handling security rules regarding Apartment ownership
 * Uses Drizzle ORM for CRUD operations
 */

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

@Injectable()
export class RoomsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database
  ) {}

  /**
   * Security helper methor to verify the ownership of a single apartment
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} apartmentId - UUID value for the apartment
   * @throws {ForbiddenException} - In case apartment does not belong to the user or it is not found
   * @returns {Promise<void>}
   */
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

  /**
   * Gets a list of rooms, verifies ownership and additional filters
   * @param {string} userId - UUID credentials of the room owner
   * @param {Object} [filters] - Query filters
   * @param {string} [filters.apartmentId] - Query optional filter that targets a specific apartment
   * @param {string} [filters.locationId] - Query optional filter that targets a specific location
   * @returns {Promise<Room[]>} - Array objects of rooms
   */
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

  /**
   * Gets a single room based on roomId and userId
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} roomId - single UUID room credential
   * @throws {NotFoundException} - In case Room is not found
   * @returns {Promise<Room>} - Single room object
   */

  async getById(userId: string, roomId: string): Promise<Room> {
    const room = await this.db.query.rooms.findFirst({
      where: (fields, { eq }) => eq(fields.id, roomId),
    })
    if (!room) throw new NotFoundException('Room not found')

    await this.verifyApartmentOwnership(room.apartmentId, userId)
    return room
  }

  /**
   * Creates a room after verifying ownership
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} apartmentId - single UUID for apartment
   * @param {Omit<NewRoom, 'apartmentId'>} data - Room details (name, etc.)
   * @throws {InternalServerErrorException} - Exception in case the database cannot return room object
   * @returns {Promise<Room>} - Created room object
   */
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

  /**
   * Updates room details after verifying ownership
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} roomId - single UUID for room
   * @param {Partial<Omit<NewRoom, 'apartmentId'>>} data - Room details to be updated (name, etc.)
   * @throws {NotFoundException} - Exception in case the room object is not found
   * @throws {InternalServerErrorException} - Exception in case the database cannot return room object
   * @returns {Promise<Room>} - Updated room object
   */
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

  /**
   * Deletes room details after verifying ownership
   * @param {string} userId - UUID credentials of the room owner
   * @param {string} roomId - single UUID for room
   * @throws {NotFoundException} - Exception in case the room object is not found
   * @returns {Promise<boolean>} - Confirmation if room was deleted, otherwise Not Found
   */
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
