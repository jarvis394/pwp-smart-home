/**
 * @file Services for handling Apartment resources
 * In charge of handling security rules regarding ownership
 * Uses Drizzle ORM for CRUD operations
 */
import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { Database, DrizzleAsyncProvider } from '../db/drizzle.module'
import { eq, and } from '@smart-home/db'
import { Apartment, NewApartment, apartments } from '@smart-home/db/schema'

@Injectable()
export class ApartmentsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database
  ) {}

  /**
   * Gets a list of apartments and verifies ownership
   * @async
   * @param {string} userId - UUID credentials of the apartment owner
   * @returns {Promise<Apartment[]>} - Array objects of apartments
   */
  async getApartments(userId: string): Promise<Apartment[]> {
    return await this.db.query.apartments.findMany({
      where: (fields, { eq }) => eq(fields.userId, userId),
    })
  }

  /**
   * Gets a single apartment based on apartmentId and userId
   * @async
   * @param {string} userId - UUID credentials of the apartment owner
   * @param {string} apartmentId - single UUID aparment credential
   * @throws {NotFoundException} - In case Apartment is not found
   * @returns {Promise<Apartment>} - Single apartment object
   */
  async getById(userId: string, id: string): Promise<Apartment> {
    const apartment = await this.db.query.apartments.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, id), eq(fields.userId, userId)),
    })
    if (!apartment) throw new NotFoundException('Apartment not found')
    return apartment
  }

  /**
   * Creates an apartment after verifying ownership
   * @async
   * @param {string} userId - UUID credentials of the apartment owner
   * @param {Omit<NewApartment, 'userId'>} data - Apartment details (name, etc.)
   * @throws {InternalServerErrorException} - Exception in case the database cannot return apartment object
   * @returns {Promise<Apartment>} - Created apartment object
   */
  async create(
    userId: string,
    data: Omit<NewApartment, 'userId'>
  ): Promise<Apartment> {
    const [result] = await this.db
      .insert(apartments)
      .values({ ...data, userId })
      .returning()

    if (!result)
      throw new InternalServerErrorException('Failed to create apartment')
    return result
  }

  /**
   * Updates apartment details after verifying ownership
   * @async
   * @param {string} userId - UUID credentials of the apartment owner
   * @param {string} id - single UUID for apartment
   * @param {Partial<Omit<NewApartment, 'userId'>>} data - Apartment details to be updated (name, etc.)
   * @throws {InternalServerErrorException} - Exception in case the database cannot return apartment object
   * @returns {Promise<Apartment>} - Updated apartment object
   */
  async update(
    userId: string,
    id: string,
    data: Partial<Omit<NewApartment, 'userId'>>
  ): Promise<Apartment> {
    const [result] = await this.db
      .update(apartments)
      .set(data)
      .where(and(eq(apartments.id, id), eq(apartments.userId, userId)))
      .returning()

    if (!result) throw new InternalServerErrorException('Apartment not found')
    return result
  }

  /**
   * Deletes apartment details after verifying ownership
   * @async
   * @param {string} userId - UUID credentials of the apartment owner
   * @param {string} id - single UUID for apartment
   * @throws {NotFoundException} - Exception in case the apartment object is not found
   * @returns {Promise<boolean>} - Confirmation if apartment was deleted, otherwise Not Found
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const [result] = await this.db
      .delete(apartments)
      .where(and(eq(apartments.id, id), eq(apartments.userId, userId)))
      .returning()

    if (!result) throw new NotFoundException('Apartment not found')
    return true
  }
}
