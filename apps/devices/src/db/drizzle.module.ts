import { Module } from '@nestjs/common'
import { db } from '@smart-home/db/client'

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider'

export type Database = typeof db

@Module({
  providers: [
    {
      provide: DrizzleAsyncProvider,
      useValue: db,
    },
  ],
  exports: [DrizzleAsyncProvider],
})
export class DrizzleModule {}
