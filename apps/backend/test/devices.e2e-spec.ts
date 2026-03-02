import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'
import { of } from 'rxjs'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

describe('Devices (e2e)', () => {
  let app: INestApplication
  let token: string

  beforeAll(async () => {
    //createTestingModule() method takes module metadats and returns a Testing Module instance
    //For unit tests, the method used is compile(), which is asynchronous.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('DEVICES_SERVICE')
      .useValue({
        send: jest.fn().mockImplementation((pattern) => {
          if (pattern.cmd === 'getDevices') {
            return of({ devices: [{ id: 'mock-1', name: 'Mock Device' }] })
          }
          if (pattern.cmd === 'getFavoriteDevices') {
            return of({ devices: [{ id: 'mock-1', name: 'Mock Device' }] })
          }
          return of({})
        }),
      })
      .compile()

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

  it('GET /api/devices - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/api/devices')

    expect(res.status).toBe(401)
  })

  it('GET /api/devices/favorites - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/api/devices/favorites')

    expect(res.status).toBe(401)
  })

  it('POST /api/devices/add - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).post('/api/devices/add')

    expect(res.status).toBe(401)
  })

  it('GET /api/devices - 200: return list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/devices')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('devices')
    expect(Array.isArray(res.body.devices)).toBe(true)
  })

  it('GET /api/devices/favorites - 200: return favorites', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/devices/favorites')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('devices')
    expect(Array.isArray(res.body.devices)).toBe(true)
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
