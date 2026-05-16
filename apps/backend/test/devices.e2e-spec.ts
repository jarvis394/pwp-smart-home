/**
 * @file E2E tests for Devices endpoints
 * Tests creating, reading, updating, and deleting devices
 * Verifies that auth tokens and user ownership logic block bad requests
 */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'
import { of } from 'rxjs'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

describe('Devices (e2e)', () => {
  let app: INestApplication
  let token: string
  let userId: string

  const NON_EXISTENT_USER_ID = '00000000-0000-0000-0000-000000000000'

  const mockDevice = {
    id: 'mock-1',
    name: 'Mock Device',
    model: 'Mock Model',
    type: 'Light',
    favorite: false,
    state: 'ONLINE',
    capabilities: {},
    userId: '',
    roomId: null,
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('DEVICES_SERVICE')
      .useValue({
        send: jest.fn().mockImplementation((pattern) => {
          console.log('Mock send called with:', pattern)
          switch (pattern.cmd) {
            case 'getDevices':
              return of([mockDevice])
            case 'getFavoriteDevices':
              return of([mockDevice])
            case 'addDevice':
              return of({ ...mockDevice, id: 'mock-new', name: 'New Device' })
            case 'toggleFavoriteDevice':
              return of({ state: true })
            case 'setDeviceState':
              return of({ on: true })
            case 'deleteDevice':
              return of(true)
            default:
              return of({})
          }
        }),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe())
    await app.init()

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'dl3@test.com', password: 'dl3test123' })

    token = loginRes.body.tokens.accessToken
    userId = loginRes.body.user.id
  })

  it('GET /api/user/{user_id}/devices - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/user/${userId}/devices`
    )
    expect(res.status).toBe(401)
  })

  it('GET /api/user/{user_id}/favorites - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/user/${userId}/favorites`
    )
    expect(res.status).toBe(401)
  })

  it('POST /api/user/{user_id}/devices - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/devices`)
      .send({ name: 'X', type: 'Light' })
    expect(res.status).toBe(401)
  })

  it('DELETE /api/user/{user_id}/devices/{device_id} - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).delete(
      `/api/user/${userId}/devices/mock-1`
    )
    expect(res.status).toBe(401)
  })

  it('GET /api/user/{user_id}/devices - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${NON_EXISTENT_USER_ID}/devices`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('GET /api/user/{user_id}/favorites - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${NON_EXISTENT_USER_ID}/favorites`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('GET /api/user/{user_id}/devices - 200: return list', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/devices`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].id).toBeDefined()
  })

  it('GET /api/user/{user_id}/favorites - 200: return favorites', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/favorites`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].id).toBeDefined()
  })

  it('POST /api/user/{user_id}/devices - 201: add device', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/devices`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Smart Bulb', type: 'Light', roomId: null })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('New Device')
  })

  it('PUT /api/user/{user_id}/devices/{device_id}/state?toggle=on - 200: toggle state', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}/devices/mock-1/state?toggle=on`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('on')
  })

  it('PUT /api/user/{user_id}/devices/{device_id}/favorite - 200: toggle favorite', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}/devices/mock-1/favorite`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.favorite).toBe(true)
  })

  it('DELETE /api/user/{user_id}/devices/{device_id} - 200: delete device', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/user/${userId}/devices/mock-1`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  afterAll(async () => {
    const cacheManager = app.get(CACHE_MANAGER)
    const stores = cacheManager.stores || [cacheManager.store]
    for await (const store of stores) {
      if (store?.client?.flushall) {
        await store.client.flushall()
      } else if (store?.clear) {
        await store.clear()
      }
    }
    await app.close()
  })
})
