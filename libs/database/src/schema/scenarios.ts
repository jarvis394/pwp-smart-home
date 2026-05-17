import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm'
import { pgTable, varchar, boolean, jsonb } from 'drizzle-orm/pg-core'

import { defaultId, defaultJsonbValue, timestamps } from '../extend'
import { users } from './users'

export const scenarios = pgTable('scenarios', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  name: varchar({ length: 512 }).notNull(),
  isActive: boolean().notNull().default(false),
  // TODO: add types
  actions: jsonb().notNull().default(defaultJsonbValue),
  userId: varchar()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  ...timestamps(),
})

export const scenariosRelations = relations(scenarios, ({ one }) => ({
  user: one(users, {
    fields: [scenarios.userId],
    references: [users.id],
  }),
}))

export type Scenario = InferSelectModel<typeof scenarios>

export type NewScenario = InferInsertModel<typeof scenarios>
