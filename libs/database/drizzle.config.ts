import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import path from 'path'

dotenv.config({ path: path.join('../../.env') })

export default defineConfig({
  dialect: 'postgresql',
  out: './src/drizzle',
  schema: './src/schema/index.ts',
  // Resulting schema fields are in snake_case
  casing: 'snake_case',
  dbCredentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env['POSTGRES_URL']!,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
  breakpoints: false,
})
