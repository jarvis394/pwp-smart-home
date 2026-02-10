/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { db } from './client'
import { apartments, rooms, users, devices } from './schema'
import { devices as MOCK_DEVICES } from '@smart-home/shared'

async function main() {
  const [user] = await db
    .insert(users)
    .values({
      email: 'hello@yekushev.dev',
      firstName: 'Vladislav',
      lastName: 'Ekushev',
      password: 'qwerty',
    })
    .returning()

  const [apartment] = await db
    .insert(apartments)
    .values({
      location: 'Oulu',
      name: 'Home',
      userId: user!.id,
    })
    .returning()

  const [room] = await db
    .insert(rooms)
    .values({
      location: 'Kitchen',
      name: 'Kitchen',
      apartmentId: apartment!.id,
    })
    .returning()

  const insertedDevices = await db
    .insert(devices)
    .values(
      MOCK_DEVICES.map((e) => ({ ...e, userId: user!.id, roomId: room!.id }))
    )
    .returning()

  console.log({ user, apartment, room, devices: insertedDevices })
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
