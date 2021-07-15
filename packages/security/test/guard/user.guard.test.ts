import { HttpService, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import request from 'supertest'
import { TestModule } from './test.module'

@suite('[Guard] User Guard')
export class UserGuardTest {
  private server: any

  async before() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(HttpService)
      .useValue({
        get: (path: string, params: any) => ({
          toPromise: () => {
            if (params.headers.Authorization !== 'SHOULD_ASSERT_OK')
              throw new Error('Invalid token')
            return Promise.resolve({ data: { id: 1 } })
          },
        }),
      })
      .compile()

    const app = await module.createNestApplication().init()

    this.server = app.getHttpServer()
  }

  @test('Given no token provided then return 403')
  invocationWithoutToken() {
    return request(this.server)
      .get('/user')
      .expect(HttpStatus.FORBIDDEN)
  }

  @test('Given invalid token then return 403')
  invocationWithInvalidToken() {
    return request(this.server)
      .get('/user')
      .auth('invalid', { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN)
  }

  @test('Given valid token then return 200')
  async invocationWithValidToken() {
    const response = await request(this.server)
      .get('/user')
      .auth('SHOULD_ASSERT_OK', { type: 'bearer' })
      .expect(HttpStatus.OK)
    expect(response.body.id).toBe("1")
  }

  @test('Given token sent without bearer then return 403')
  noBearerToken() {
    return request(this.server)
      .get('/user')
      .set('Authorization', 'SHOULD_ASSERT_OK')
      .expect(HttpStatus.FORBIDDEN)
  }

  @test('Given module without user auth provider url the return 403')
  async moduleMisconfigured() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(ConfigService)
      .useValue({ get: (path: string) => null })
      .compile()

    const app = await module.createNestApplication().init()

    return request(app.getHttpServer())
      .get('/user')
      .auth('SHOULD_ASSERT_OK', { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN)
  }
}
