import type { HasDefault, NotNull } from 'drizzle-orm'
import type { PgTimestampBuilderInitial } from 'drizzle-orm/pg-core'
// eslint-disable-next-line no-duplicate-imports
import { sql } from 'drizzle-orm'
// eslint-disable-next-line no-duplicate-imports
import { timestamp } from 'drizzle-orm/pg-core'

/** Generates UUID for primary key or UUID columns */
export const defaultId = sql`gen_random_uuid()`

/** Generates default value for JSONB column */
export const defaultJsonbValue = sql`'{}'::jsonb`

// This is common columns, `deleted_at` are optional
export function timestamps(props?: { softDelete?: false }): {
  createdAt: NotNull<HasDefault<PgTimestampBuilderInitial<''>>>
  updatedAt: NotNull<HasDefault<PgTimestampBuilderInitial<''>>>
}
export function timestamps(props: { softDelete: true }): {
  createdAt: NotNull<HasDefault<PgTimestampBuilderInitial<''>>>
  updatedAt: NotNull<HasDefault<PgTimestampBuilderInitial<''>>>
  deletedAt: PgTimestampBuilderInitial<''>
}
export function timestamps(props?: { softDelete?: boolean }) {
  const commonTimestamps = {
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  }
  const deleteTimestamp = {
    deletedAt: timestamp({ withTimezone: true }),
  }
  return props?.softDelete
    ? { ...commonTimestamps, ...deleteTimestamp }
    : commonTimestamps
}
