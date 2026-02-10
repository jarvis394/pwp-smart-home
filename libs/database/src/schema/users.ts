import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm'
import { pgTable, varchar } from 'drizzle-orm/pg-core'

import { defaultId } from '../extend'
import { apartments } from './apartments'
import { devices } from './devices'
import { scenarios } from './scenarios'

export const users = pgTable('users', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  email: varchar({ length: 256 }).notNull().unique(),
  password: varchar({ length: 256 }).notNull(),
  firstName: varchar({ length: 128 }).notNull(),
  lastName: varchar({ length: 128 }),
})

export const usersRelations = relations(users, ({ many }) => ({
  apartments: many(apartments),
  scenarios: many(scenarios),
  devices: many(devices),
}))

export type User = InferSelectModel<typeof users>

export type NewUser = InferInsertModel<typeof users>
