import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'

describe('Devices (e2e)', () => {
  let app: INestApplication
  let accessToken: string
  let refreshToken: string
  beforeAll(async () => {
    //createTestingModule() method takes module metadats and returns a Testing Module instance
    //For unit tests, the method used is compile(), which is asynchronous.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    //Nest is used to emulate HTTP request in e2e testing by using Supertest library
    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  it('POST /api/auth/register - 201: valid register', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'authtest_new@test.com',
        password: 'authtest123',
        firstName: 'Auth',
        lastName: 'Test',
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('tokens')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user.email).toBe('authtest_new@test.com')
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

  it('POST /api/auth/login - 403: invalid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'dl3@test.com',
        password: 'wrongpassword',
      })

    expect(res.status).toBe(403)
  })

  it('POST /api/auth/login - 400: invalid email format', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: 'dl3test123',
      })

    expect(res.status).toBe(403)
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
    await app.close()
  })
})
