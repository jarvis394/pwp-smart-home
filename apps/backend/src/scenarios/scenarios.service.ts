import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { Database, DrizzleAsyncProvider } from '../db/drizzle.module'
import { eq, and } from '@smart-home/db'
import { Scenario, NewScenario, scenarios } from '@smart-home/db/schema'

@Injectable()
export class ScenariosService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: Database
  ) {}

  async getScenarios(userId: string): Promise<Scenario[]> {
    return await this.db.query.scenarios.findMany({
      where: (fields, { eq }) => eq(fields.userId, userId),
    })
  }

  async getById(userId: string, id: string): Promise<Scenario> {
    const scenario = await this.db.query.scenarios.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, id), eq(fields.userId, userId)),
    })

    if (!scenario) throw new NotFoundException('Scenario not found')
    return scenario
  }

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

  async update(
    id: string,
    data: Partial<Omit<NewScenario, 'userId'>>
  ): Promise<Scenario> {
    const [result] = await this.db
      .update(scenarios)
      .set(data)
      .where(eq(scenarios.id, id))
      .returning()

    if (!result) throw new NotFoundException('Scenario not found')
    return result
  }

  async toggleActive(userId: string, id: string): Promise<Scenario> {
    const scenario = await this.getById(userId, id)

    const [result] = await this.db
      .update(scenarios)
      .set({ isActive: !scenario.isActive })
      .where(eq(scenarios.id, id))
      .returning()

    if (!result) throw new NotFoundException('Scenario not found')
    return result
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.db
      .delete(scenarios)
      .where(eq(scenarios.id, id))
      .returning()

    if (!result) throw new NotFoundException('Scenario not found')
    return true
  }
}
