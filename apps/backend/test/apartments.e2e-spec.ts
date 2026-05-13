import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'

describe('Apartments (e2e)', () => {
  let app: INestApplication
  let token: string
  let apartmentId: string
  let userId: string

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
  })

  // ---------- CREATE ----------
  it('POST /api/user/{user_id}/apartments - 201: valid request', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/apartments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Home', location: 'Helsinki' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Test Home')
    expect(res.body.location).toBe('Helsinki')

    apartmentId = res.body.id
  })

  it('POST /api/user/{user_id}/apartments - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/apartments`)
      .send({ name: 'Test Home', location: 'Helsinki' })

    expect(res.status).toBe(401)
  })

  it('POST /api/user/{user_id}/apartments - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${NON_EXISTENT_USER_ID}/apartments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Home', location: 'Helsinki' })

    expect(res.status).toBe(403)
  })

  it('POST /api/user/{user_id}/apartments - 400: invalid request', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/apartments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Home' })

    expect(res.status).toBe(400)
  })

  it('GET /api/user/{user_id}/apartments - 200: return list', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/apartments`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/user/{user_id}/apartments - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/user/${userId}/apartments`
    )

    expect(res.status).toBe(401)
  })

  it('GET /api/user/{user_id}/apartments - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${NON_EXISTENT_USER_ID}/apartments`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('GET /api/user/{user_id}/apartments/:apartment_id - 200: single apartment', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(apartmentId)
  })

  it('GET /api/user/{user_id}/apartments/:apartment_id - 404: invalid id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/apartments/invalid-uuid`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('PUT /api/user/{user_id}/apartments/:apartment_id - 200: update apartment', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Home' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Updated Home')
  })

  it('DELETE /api/user/{user_id}/apartments/:apartment_id - 200: apartment deleted', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/user/${userId}/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('GET /api/user/{user_id}/apartments/:apartment_id - 404: apartment not found after deleted', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  afterAll(async () => {
    await app.close()
  })
})
