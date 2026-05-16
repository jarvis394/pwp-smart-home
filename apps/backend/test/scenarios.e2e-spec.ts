/**
 * @file E2E tests for Scenarios endpoints
 * Tests creating, reading, updating, and deleting scenarios
 * Verifies that auth tokens and user ownership logic block bad requests
 */
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'

describe('Scenarios (e2e)', () => {
  let app: INestApplication
  let token: string
  let userId: string
  let scenarioId: string

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

  it('POST /api/user/{user_id}/scenarios - 201: valid request', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/scenarios`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dim Lights',
        actions: [{ lights: 'off', blinds: 'closed' }],
      })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Dim Lights')

    scenarioId = res.body.id
  })

  it('POST /api/user/{user_id}/scenarios - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/scenarios`)
      .send({
        name: 'Dim Lights',
        actions: [{ lights: 'off', blinds: 'closed' }],
      })

    expect(res.status).toBe(401)
  })

  it('POST /api/user/{user_id}/scenarios - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${NON_EXISTENT_USER_ID}/scenarios`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Hack Scenario',
        actions: [{ lights: 'on' }],
      })

    expect(res.status).toBe(403)
  })

  it('POST /api/user/{user_id}/scenarios - 400: invalid request (missing actions)', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/user/${userId}/scenarios`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lights Off' })

    expect(res.status).toBe(400)
  })

  it('GET /api/user/{user_id}/scenarios - 200: return list', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/scenarios`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/user/{user_id}/scenarios - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/user/${userId}/scenarios`
    )

    expect(res.status).toBe(401)
  })

  it('GET /api/user/{user_id}/scenarios - 403: forbidden (different user)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${NON_EXISTENT_USER_ID}/scenarios`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('GET /api/user/{user_id}/scenarios/:scenario_id - 200: single scenario', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/scenarios/${scenarioId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(scenarioId)
  })

  it('GET /api/user/{user_id}/scenarios/:scenario_id - 404: invalid id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/scenarios/invalid-uuid`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  it('PUT /api/user/{user_id}/scenarios/:scenario_id - 200: update scenario', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}/scenarios/${scenarioId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Reading Lights' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Reading Lights')
  })

  it('PUT /api/user/{user_id}/scenarios/:scenario_id/state?active=true - 200: activate scenario', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}/scenarios/${scenarioId}/state?active=true`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(true)
  })

  it('PUT /api/user/{user_id}/scenarios/:scenario_id/state?active=false - 200: deactivate scenario', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}/scenarios/${scenarioId}/state?active=false`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(false)
  })

  it('PUT /api/user/{user_id}/scenarios/:scenario_id/state - 400: missing active parameter', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/user/${userId}/scenarios/${scenarioId}/state`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })

  it('DELETE /api/user/{user_id}/scenarios/:scenario_id - 200: scenario deleted', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/user/${userId}/scenarios/${scenarioId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('GET /api/user/{user_id}/scenarios/:scenario_id - 404: scenario not found after delete', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/user/${userId}/scenarios/${scenarioId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })

  afterAll(async () => {
    await app.close()
  })
})
