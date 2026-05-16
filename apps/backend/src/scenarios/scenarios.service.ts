/**
 * @file Services for handling Scenario resources
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
import { eq } from '@smart-home/db'
import { Scenario, NewScenario, scenarios } from '@smart-home/db/schema'

@Injectable()
export class ScenariosService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database
  ) {}

  /**
   * Gets a list of scenarios and verifies ownership
   * @param {string} userId - UUID credentials of the scenario owner
   * @returns {Promise<Scenario[]>} - Array objects of scenarios
   */
  async getScenarios(userId: string): Promise<Scenario[]> {
    return await this.db.query.scenarios.findMany({
      where: (fields, { eq }) => eq(fields.userId, userId),
    })
  }

  /**
   * Gets a single scenario based on userId and id
   * @param {string} userId - UUID credentials of the scenario owner
   * @param {string} id - single UUID scenario credential
   * @throws {NotFoundException} - In case Scenario is not found
   * @returns {Promise<Scenario>} - Single scenario object
   */
  async getById(userId: string, id: string): Promise<Scenario> {
    const scenario = await this.db.query.scenarios.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, id), eq(fields.userId, userId)),
    })
    if (!scenario) throw new NotFoundException('Scenario not found')
    return scenario
  }

  /**
   * Creates an scenario after verifying ownership
   * @param {string} userId - UUID credentials of the scenario owner
   * @param {Omit<NewScenario, 'userId'>} data - Scenario details (name, etc.)
   * @throws {InternalServerErrorException} - Exception in case the database cannot return scenario object
   * @returns {Promise<Scenario>} - Created scenario object
   */
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

  /**
   * Updates scenario details after verifying ownership
   * @param {string} userId - UUID credentials of the scenario owner
   * @param {string} id - single UUID for scenario
   * @param {Partial<Omit<NewScenario, 'userId'>>} data - Scenario details to be updated (name, etc.)
   * @throws {InternalServerErrorException} - Exception in case the database cannot return the scenario object
   * @throws {NotFoundException} - Exception in case the database cannot find the scenario object
   * @returns {Promise<Scenario>} - Updated scenario object
   */
  async update(
    userId: string,
    id: string,
    data: Partial<Omit<NewScenario, 'userId'>>
  ): Promise<Scenario> {
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

  /**
   * Sets an scenario status active after verifying ownership
   * @param {string} userId - UUID credentials of the scenario owner
   * @param {string} id - single UUID for scenario
   * @param {string} active - Boolean status
   * @throws {NotFoundException} - Exception in case the scenario object is not found
   * @returns {Promise<boolean>} - Confirmation if scenario status was set
   */
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

  /**
   * Deletes scenario details after verifying ownership
   * @param {string} userId - UUID credentials of the scenario owner
   * @param {string} id - single UUID for scenario
   * @throws {NotFoundException} - Exception in case the scenario object is not found
   * @returns {Promise<boolean>} - Confirmation if apartment was deleted, otherwise Not Found
   */
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
