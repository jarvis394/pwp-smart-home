/**
 * @file E2E tests for Rooms endpoints
 * Tests creating, reading, updating, and deleting rooms
 * Verifies that auth tokens and user ownership logic block bad requests
 */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

describe('Rooms (e2e)', () => {
  let app: INestApplication
  let token: string
  let userId: string
  let apartmentId: string
  let roomId: string

  const NON_EXISTENT_USER_ID = '00000000-0000-0000-0000-000000000000'

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe())
    await app.init()

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'dl3@test.com', password: 'dl3test123' })

    token = loginRes.body.tokens.accessToken
    userId = loginRes.body.user.id

    const aptRes = await request(app.getHttpServer())
      .post(`/api/user/${userId}/apartments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Apartment', location: 'Oulu' })

    apartmentId = aptRes.body.id
  })

  it('POST /api/user/{user_id}/rooms?apartment={apartment_id} - 201: create room', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/rooms?apartment=${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Living Room' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Living Room')
    expect(res.body.apartmentId).toBe(apartmentId)

    roomId = res.body.id
  })

  it('POST /api/user/{user_id}/rooms?apartment={apartment_id} - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/rooms?apartment=${apartmentId}`)
      .send({ name: 'Unauthorized Room' })

    expect(res.status).toBe(401)
  })

  it('POST /api/user/{user_id}/rooms?apartment={apartment_id} - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${NON_EXISTENT_USER_ID}/rooms?apartment=${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hacked Room' })

    expect(res.status).toBe(403)
  })

  it('POST /api/user/{user_id}/rooms - 400: missing required apartment query', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/rooms`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No Apartment Room' })

    expect(res.status).toBe(400)
  })

  it('GET /api/user/{user_id}/rooms - 200: list all rooms', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/rooms`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/user/{user_id}/rooms?apartment={apartment_id} - 200: filter by apartment', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/rooms?apartment=${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    for (const room of res.body) {
      expect(room.apartmentId).toBe(apartmentId)
    }
  })

  it('GET /api/user/{user_id}/rooms - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/user/${userId}/rooms`
    )

    expect(res.status).toBe(401)
  })

  it('GET /api/user/{user_id}/rooms - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${NON_EXISTENT_USER_ID}/rooms`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('GET /api/user/{user_id}/rooms/:room_id - 200: get single room', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(roomId)
  })

  it('GET /api/user/{user_id}/rooms/:room_id - 404: invalid id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/rooms/invalid-uuid`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('PUT /api/user/{user_id}/rooms/:room_id - 200: update room', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Master Bedroom' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Master Bedroom')
  })

  it('DELETE /api/user/{user_id}/rooms/:room_id - 200: delete room', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/user/${userId}/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('GET /api/user/{user_id}/rooms/:room_id - 404: room not found after delete', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete(`/api/user/${userId}/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

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
