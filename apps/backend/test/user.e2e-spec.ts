import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app/app.module'

describe('User (e2e)', () => {
  let app: INestApplication
  let token: string

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

  it('GET /api/user - 200: get profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user).toHaveProperty('email')
  })

  it('POST /api/user/update - 201: valid request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
      })

    expect(res.status).toBe(201)
    expect(res.body.user.firstName).toBe('John')
    expect(res.body.user.lastName).toBe('Doe')
  })

  //Using a buffer transparent image since supertest MIME type is image/png, as to not re edit the controller regex
  it('POST /api/user/uploadAvatar - 201: upload image', async () => {
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    )

    const res = await request(app.getHttpServer())
      .post('/api/user/uploadAvatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', buffer, {
        filename: 'test-avatar.png',
        contentType: 'image/png',
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('avatarUrl')
  })

  //Test for wrong file format
  it('POST /api/user/uploadAvatar - 400: wrong file type', async () => {
    const wrongFilebuffer = Buffer.from(
      'this is just a text file, not an image'
    )

    const res = await request(app.getHttpServer())
      .post('/api/user/uploadAvatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', wrongFilebuffer, {
        filename: 'not-an-image.txt',
        contentType: 'text/plain',
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('Validation failed')
  })

  it('GET /api/user - 401: unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/api/user')

    expect(res.status).toBe(401)
  })

  afterAll(async () => {
    await app.close()
  })
})
