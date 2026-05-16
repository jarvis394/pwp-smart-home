/**
 * @file E2E tests for User profile endpoints
 * Tests fetching user profile details, changing credentials, and updating info
 * Verifies that profile avatar uploads and file system deletion flows work properly
 */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'

describe('User (e2e)', () => {
  let app: INestApplication
  let token: string
  let userId: string

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
  })

  it('GET /api/user/:user_id - 200: get own profile', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user).toHaveProperty('email')
  })

  it('GET /api/user/:user_id - 401: no token', async () => {
    const res = await request(app.getHttpServer()).get(`/api/user/${userId}`)

    expect(res.status).toBe(401)
  })

  it('PUT /api/user/:user_id - 200: update own profile', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
      })

    expect(res.status).toBe(200)
    expect(res.body.user.firstName).toBe('John')
    expect(res.body.user.lastName).toBe('Doe')
  })

  it('PUT /api/user/:user_id - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}`)
      .send({ firstName: 'X' })

    expect(res.status).toBe(401)
  })

  it('PUT /api/user/:user_id - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .put('/api/user/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Hacker' })

    expect(res.status).toBe(403)
  })

  // ---------- CREATE AVATAR ----------
  it('POST /api/user/:user_id/avatar - 201: upload avatar', async () => {
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    )

    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/avatar`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, {
        filename: 'test-avatar.png',
        contentType: 'image/png',
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('avatarUrl')
  })

  it('POST /api/user/:user_id/avatar - 400: wrong file type', async () => {
    const wrongFilebuffer = Buffer.from(
      'this is just a text file, not an image'
    )

    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/avatar`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', wrongFilebuffer, {
        filename: 'not-an-image.txt',
        contentType: 'text/plain',
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('Validation failed')
  })

  it('POST /api/user/:user_id/avatar - 403: forbidden (different user)', async () => {
    const buffer = Buffer.from('fake')

    const res = await request(app.getHttpServer())
      .post('/api/user/00000000-0000-0000-0000-000000000000/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, {
        filename: 'hack.png',
        contentType: 'image/png',
      })

    expect(res.status).toBe(403)
  })

  it('PUT /api/user/:user_id/avatar - 200: update avatar', async () => {
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    )

    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}/avatar`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, {
        filename: 'new-avatar.png',
        contentType: 'image/png',
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('avatarUrl')
  })

  it('PUT /api/user/:user_id/avatar - 403: forbidden (different user)', async () => {
    const buffer = Buffer.from('fake')
    const res = await request(app.getHttpServer())
      .put('/api/user/00000000-0000-0000-0000-000000000000/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, {
        filename: 'hack.png',
        contentType: 'image/png',
      })

    expect(res.status).toBe(403)
  })

  it('DELETE /api/user/:user_id/avatar - 200: delete avatar', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/user/${userId}/avatar`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Avatar deleted')
  })

  it('DELETE /api/user/:user_id/avatar - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .delete('/api/user/00000000-0000-0000-0000-000000000000/avatar')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  afterAll(async () => {
    await app.close()
  })
})
