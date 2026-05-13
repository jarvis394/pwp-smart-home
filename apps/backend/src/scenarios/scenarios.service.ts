import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { Database, DrizzleAsyncProvider } from '../db/drizzle.module'
import { eq } from '@smart-home/db'
import { Scenario, NewScenario, scenarios } from '@smart-home/db/schema'

// Service for managing user scenarios, including business logic for CRUD operations
// and ensuring proper ownership and error handling
@Injectable()
export class ScenariosService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database
  ) {}

  /// Method to retrieve all scenarios for a specific user
  async getScenarios(userId: string): Promise<Scenario[]> {
    return await this.db.query.scenarios.findMany({
      where: (fields, { eq }) => eq(fields.userId, userId),
    })
  }

  /// Method to retrieve a specific scenario by ID for a specific user
  async getById(userId: string, id: string): Promise<Scenario> {
    const scenario = await this.db.query.scenarios.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, id), eq(fields.userId, userId)),
    })
    if (!scenario) throw new NotFoundException('Scenario not found')
    return scenario
  }

  // Method to create a new scenario for a specific user
  async create(
    userId: string,
    data: Omit<NewScenario, 'userId'>
  ): Promise<Scenario> {
    const [result] = await this.db
      .insert(scenarios)
      .values({ ...data, userId })
      .returning()
    if (!result)
      throw new InternalServerErrorException('Failed to create scenario')
    return result
  }

  // Method to update an existing scenario for a specific user, allowing partial updates
  async update(
    userId: string,
    id: string,
    data: Partial<Omit<NewScenario, 'userId'>>
  ): Promise<Scenario> {
    // verify ownership
    const existing = await this.db.query.scenarios.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, id), eq(fields.userId, userId)),
    })
    if (!existing) throw new NotFoundException('Scenario not found')

    const [result] = await this.db
      .update(scenarios)
      .set(data)
      .where(eq(scenarios.id, id))
      .returning()
    if (!result)
      throw new InternalServerErrorException('Failed to update scenario')
    return result
  }

  // Method to set the active state of a scenario for a specific user,
  // ensuring that the scenario belongs to the user and handling potential
  // errors during the update process
  async setActive(
    userId: string,
    id: string,
    active: boolean
  ): Promise<Scenario> {
    await this.getById(userId, id)
    const [result] = await this.db
      .update(scenarios)
      .set({ isActive: active })
      .where(eq(scenarios.id, id))
      .returning()
    if (!result) throw new NotFoundException('Scenario not found')
    return result
  }

  // Method to delete a scenario by its ID for a specific user,
  // ensuring that the scenario belongs to the user and handling potential errors
  // during the deletion process
  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await this.db.query.scenarios.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, id), eq(fields.userId, userId)),
    })
    if (!existing) throw new NotFoundException('Scenario not found')

    const [result] = await this.db
      .delete(scenarios)
      .where(eq(scenarios.id, id))
      .returning()
    if (!result) throw new NotFoundException('Scenario not found')
    return true
  }
}
