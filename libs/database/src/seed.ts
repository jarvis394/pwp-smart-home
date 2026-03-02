/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { db } from './client'
import { apartments, rooms, users, devices, scenarios } from './schema'
import * as schema from './schema'
import { devices as MOCK_DEVICES } from './mock/devices'
import { DeviceCapabilityType } from './types'
import { reset } from 'drizzle-seed'

async function main() {
  await reset(db, schema)

  const [user] = await db
    .insert(users)
    .values([
      {
        email: 'hello@yekushev.dev',
        firstName: 'Vladislav',
        lastName: 'Ekushev',
        // hashed 'qwerty'
        password:
          '$2a$12$ep7KSW1nL5G1YgCd2vzrLOjNydGLGmlA3zO1/cB29sJ9UkxlMHu0S',
      },
      {
        email: 'dl3@test.com',
        firstName: 'Test',
        lastName: 'User',
        // hashed 'dl3test123'
        password:
          '$2a$12$6WPamy8nJUlVnJXnjKFdWeGpYIhfTKqqSDYTgWjbt2nrYtJpAq3by', // hashed 'dl3test123'
      },
    ])
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

  const [scenario] = await db
    .insert(scenarios)
    .values({
      name: 'Toggle lights',
      userId: user!.id,
      isActive: false,
      actions: {
        [DeviceCapabilityType.ON_OFF]: {
          type: DeviceCapabilityType.ON_OFF,
          state: {
            instance: 'on',
          },
        },
      },
    })
    .returning()

  const insertedDevices = await db
    .insert(devices)
    .values(
      MOCK_DEVICES.map((e) => ({ ...e, userId: user!.id, roomId: room!.id }))
    )
    .returning()

  console.log({ user, apartment, room, scenario, devices: insertedDevices })
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
