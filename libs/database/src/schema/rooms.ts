import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm'
import { pgTable, varchar } from 'drizzle-orm/pg-core'

import { defaultId } from '../extend'
import { apartments } from './apartments'
import { devices } from './devices'

export const rooms = pgTable('rooms', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  name: varchar({ length: 256 }).notNull(),
  location: varchar({ length: 256 }).notNull(),
  apartmentId: varchar()
    .notNull()
    .references(() => apartments.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})


export const roomsRelations = relations(rooms, ({ one, many }) => ({
  devices: many(devices),
  apartment: one(apartments, {
    fields: [rooms.apartmentId],
    references: [apartments.id],
  }),
}))

export type Room = InferSelectModel<typeof rooms>

export type NewRoom = InferInsertModel<typeof rooms>
