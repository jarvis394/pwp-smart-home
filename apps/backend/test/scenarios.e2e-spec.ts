import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'

describe('Scenarios (e2e)', () => {
  let app: INestApplication
  let token: string
  let scenarioId: string

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

  it('POST /api/scenarios - 201: valid request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/scenarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dim Lights',
        actions: { lights: 'off', blinds: 'closed' },
      })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Dim Lights')

    scenarioId = res.body.id
  })

  it('POST /api/scenarios - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/scenarios')
      .send({
        name: 'Dim Lights',
        actions: { lights: 'off', blinds: 'closed' },
      })

    expect(res.status).toBe(401)
  })

  it('POST /api/scenarios -  400: invalid request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/scenarios')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lights Off' })

    expect(res.status).toBe(400)
  })

  it('GET /api/scenarios - 200: return list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/scenarios')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/scenarios - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/api/scenarios')

    expect(res.status).toBe(401)
  })

  it('GET /api/scenarios/:id - 200: single room', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/scenarios/${scenarioId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(scenarioId)
  })

  it('GET /api/scenarios/:id - 404: invalid id', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/scenarios/invalid-uuid')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('GET /api/scenarios/:id/toggle - 200: toggle active status', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/scenarios/${scenarioId}/toggle`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('isActive')
  })

  it('PUT /api/scenarios/:id - 200: update room', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/scenarios/${scenarioId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Reading Lights' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Reading Lights')
  })

  it('DELETE /api/scenarios:id - 200: room deleted', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/scenarios/${scenarioId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('GET /api/scenarios:id - 404: room not found after deleted', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/scenarios/${scenarioId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete(`/api/scenarios/${scenarioId}`)
      .set('Authorization', `Bearer ${token}`)

    await app.close()
  })
})
