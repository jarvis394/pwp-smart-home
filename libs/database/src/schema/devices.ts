import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm'
import { pgTable, varchar, boolean, jsonb } from 'drizzle-orm/pg-core'

import { defaultId, defaultJsonbValue, timestamps } from '../extend'
import { DeviceCapabilities, DeviceState, DeviceType } from '../types/Device'
import { users } from './users'
import { rooms } from './rooms'

export const devices = pgTable('devices', {
  id: varchar().default(defaultId).primaryKey().notNull(),
  name: varchar({ length: 512 }).notNull(),
  model: varchar({ length: 512 }),
  favorite: boolean().notNull().default(false),
  type: varchar()
    .$type<DeviceType>()
    .default(DeviceType.BASIC_DEVICE)
    .notNull(),
  capabilities: jsonb()
    .$type<DeviceCapabilities>()
    .notNull()
    .default(defaultJsonbValue),
  state: jsonb().$type<DeviceState>().notNull().default(defaultJsonbValue),
  userId: varchar()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  roomId: varchar().references(() => rooms.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  ...timestamps(),
})

export const devicesRelations = relations(devices, ({ one }) => ({
  room: one(rooms, {
    fields: [devices.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
}))

export type Device = InferSelectModel<typeof devices>

export type NewDevice = InferInsertModel<typeof devices>
