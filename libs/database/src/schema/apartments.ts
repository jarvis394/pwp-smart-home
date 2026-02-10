import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm'
import { pgTable, varchar } from 'drizzle-orm/pg-core'

import { defaultId } from '../extend'
import { users } from './users'
import { rooms } from './rooms'

export const apartments = pgTable('apartments', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  name: varchar({ length: 256 }).notNull(),
  location: varchar({ length: 256 }).notNull(),
  userId: varchar()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const apartmentsRelations = relations(apartments, ({ many }) => ({
  rooms: many(rooms),
}))

export type Apartment = InferSelectModel<typeof apartments>

export type NewApartment = InferInsertModel<typeof apartments>
