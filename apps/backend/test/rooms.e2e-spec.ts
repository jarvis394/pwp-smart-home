import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'

describe('Rooms (e2e)', () => {
  let app: INestApplication
  let token: string
  let apartmentId: string
  let roomId: string

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

    const apartment = await request(app.getHttpServer())
      .post('/api/apartments')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Apartment', location: 'Helsinki' })

    apartmentId = apartment.body.id
  })

  it('POST /api/rooms - 201: valid request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Living Room', location: 'First floor', apartmentId })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Living Room')
    expect(res.body.apartmentId).toBe(apartmentId)

    roomId = res.body.id
  })

  it('POST /api/rooms - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/rooms')
      .send({ name: 'Living Room', location: 'First Floor', apartmentId })

    expect(res.status).toBe(401)
  })

  it('POST /api/rooms -   400: invalid request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Living Room' })

    expect(res.status).toBe(400)
  })

  it('GET /api/rooms/apartment/:apartmentId - 200: return list', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/rooms/apartment/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/rooms/apartment/:apartmentId - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/rooms/apartment/${apartmentId}`
    )

    expect(res.status).toBe(401)
  })

  it('GET /api/rooms:id - 200: single room', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(roomId)
  })

  it('GET /api/rooms:id - 404: invalid id', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/rooms/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('PUT /api/rooms:id - 200: update room', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Room' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Updated Room')
  })

  it('DELETE /api/rooms:id - 200: room deleted', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('GET /api/rooms:id - 404: room not found after deleted', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete(`/api/apartments/${apartmentId}`)
      .set('Authorization', `Bearer ${token}`)

    await app.close()
  })
})
