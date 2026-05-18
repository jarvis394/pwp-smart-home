/**
 * @file E2E tests for Authentication endpoints
 * Tests user registration, login flows, and token lifecycle states
 * Makes sure fresh access tokens generate properly and logouts wipe sessions cleanly
 */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { DrizzleAsyncProvider, Database } from '../src/db/drizzle.module'
import { users } from '@smart-home/db/schema'
import { eq } from '@smart-home/db'

describe('Auth (e2e)', () => {
  let app: INestApplication
  let accessToken: string
  let refreshToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe())
    await app.init()

    const db = app.get<Database>(DrizzleAsyncProvider)
    await db.delete(users).where(eq(users.email, 'authtest@test.com'))
  })

  it('POST /api/auth/register - 201: valid register', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'authtest@test.com',
        password: 'authtest123',
        firstName: 'Auth',
        lastName: 'Test',
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('tokens')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user.email).toBe('authtest@test.com')

    const db = app.get<Database>(DrizzleAsyncProvider)
    const apartmentsList = await db.query.apartments.findMany({
      where: (fields, { eq }) => eq(fields.userId, res.body.user.id),
    })
    expect(apartmentsList.length).toBe(1)
    expect(apartmentsList[0]?.name).toBe('Home')
    expect(apartmentsList[0]?.location).toBeNull()
  })

  it('POST /api/auth/register - 400: invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'authtest123',
        firstName: 'Auth',
        lastName: 'Test',
      })

    expect(res.status).toBe(400)
  })

  it('POST /api/auth/register - 400: missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'authtest2@test.com',
      })

    expect(res.status).toBe(400)
  })

  it('POST /api/auth/login - 201: valid login', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'dl3@test.com',
        password: 'dl3test123',
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('tokens')
    expect(res.body.tokens).toHaveProperty('accessToken')
    expect(res.body.tokens).toHaveProperty('refreshToken')

    accessToken = res.body.tokens.accessToken
    refreshToken = res.body.tokens.refreshToken
  })

  it('POST /api/auth/login - 401: invalid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'dl3@test.com',
        password: 'wrongpassword',
      })

    expect(res.status).toBe(401)
  })

  it('POST /api/auth/login - 400: invalid email format', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: 'dl3test123',
      })

    expect(res.status).toBe(400)
  })

  it('GET /api/auth/refresh - 200: valid refresh token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
  })

  it('GET /api/auth/refresh - 401: no token', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/refresh')

    expect(res.status).toBe(401)
  })

  it('GET /api/auth/logout - 200: valid logout', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('GET /api/auth/logout - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/logout')

    expect(res.status).toBe(401)
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

    const db = app.get<Database>(DrizzleAsyncProvider)
    await db.delete(users).where(eq(users.email, 'authtest@test.com'))

    await app.close()
  })
})
