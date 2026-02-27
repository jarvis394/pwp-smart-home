import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { Database, DrizzleAsyncProvider } from '../db/drizzle.module'
import { eq } from '@smart-home/db'
import { Apartment, NewApartment, apartments } from '@smart-home/db/schema'

@Injectable()
export class ApartmentsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database
  ) {}

  async getApartments(userId: string): Promise<Apartment[]> {
    return await this.db.query.apartments.findMany({
      where: (fields, { eq }) => eq(fields.userId, userId),
    })
  }

  async getById(userId: string, id: string): Promise<Apartment> {
    const apartment = await this.db.query.apartments.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, id), eq(fields.userId, userId)),
    })
    if (!apartment) throw new NotFoundException('Apartment not found')
    return apartment
  }

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

  async update(
    id: string,
    data: Partial<Omit<NewApartment, 'userId'>>
  ): Promise<Apartment> {
    const [result] = await this.db
      .update(apartments)
      .set(data)
      .where(eq(apartments.id, id))
      .returning()

    if (!result) throw new InternalServerErrorException('Apartment not found')
    return result
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.db
      .delete(apartments)
      .where(eq(apartments.id, id))
      .returning()

    if (!result) throw new NotFoundException('Apartment not found')
    return true
  }
}
