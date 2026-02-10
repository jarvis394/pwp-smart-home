import * as schema from './schema'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

if (!process.env['POSTGRES_URL']) {
  throw new Error('Missing POSTGRES_URL')
}

const pool = new Pool({
  connectionString: process.env['POSTGRES_URL'],
})

export const db = drizzle(pool, { schema, casing: 'snake_case' })
