import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'

describe('Apartments (e2e)', () => {
  let app: INestApplication
  let token: string
  let apartmentId: string

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

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'dl3@test.com', password: 'dl3test123' })

    token = res.body.tokens.accessToken
  })

  it('POST /api/apartments - 201: valid request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/apartments')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Home', location: 'Helsinki' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Test Home')
    expect(res.body.location).toBe('Helsinki')

    //May need ID for later testing
    apartmentId = res.body.id
  })

  it('POST /api/apartments - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/apartments')
      .send({ name: 'Test Home', location: 'Helsinki' })

    expect(res.status).toBe(401)
  })

  it('POST /api/apartments -   400: invalid request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/apartments')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Home' })

    expect(res.status).toBe(400)
  })

  it('GET /api/apartments - 200: return list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/apartments')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/apartments - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/api/apartments')

    expect(res.status).toBe(401)
  })

  it('GET /api/apartments:id - 200: single apartment', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(apartmentId)
  })

  it('GET /api/apartments:id - 404: invalid id', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/apartments/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('PUT /api/apartments:id - 200: update apartment', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Home' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Updated Home')
  })

  it('DELETE /api/apartments:id - 200: apartment deleted', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('GET /api/apartments:id - 404: apartment not found after deleted', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  afterAll(async () => {
    await app.close()
  })
})
