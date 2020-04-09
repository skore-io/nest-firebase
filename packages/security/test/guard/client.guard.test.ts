import { HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { OAuth2Client } from 'google-auth-library'
import * as request from 'supertest'
import { TestModule } from './test.module'

@suite('[Guard] User Guard')
export class UserGuardTest {
  private server: any

  async before() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(OAuth2Client)
      .useValue({
        verifyIdToken: ({ idToken }) => {
          if (idToken !== 'VALID_PROJECT' && idToken !== 'INVALID_PROJECT')
            throw new Error('Invalid token')

          return {
            getPayload: () => ({
              email: `some-email@${
                idToken === 'INVALID_PROJECT' ? 'invalid' : 'project1'
              }.iam.gserviceaccount.com`,
              email_verified: true,
            }),
          }
        },
      })
      .compile()

    const app = await module.createNestApplication().init()

    this.server = app.getHttpServer()
  }

  @test('Given no token provided then return 401')
  invocationWithoutToken() {
    return request(this.server)
      .get('/client')
      .expect(HttpStatus.UNAUTHORIZED)
  }

  @test('Given invalid token then return 401')
  invocationWithInvalidToken() {
    return request(this.server)
      .get('/client')
      .auth('invalid', { type: 'bearer' })
      .expect(HttpStatus.UNAUTHORIZED)
  }

  @test('Given valid token then return 200')
  invocationWithValidToken() {
    return request(this.server)
      .get('/client')
      .auth('VALID_PROJECT', { type: 'bearer' })
      .expect(HttpStatus.OK)
  }

  @test('Given module without user auth provider url the return 500')
  async moduleMisconfigured() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(ConfigService)
      .useValue({ get: (path: string) => null })
      .compile()

    const app = await module.createNestApplication().init()

    return request(app.getHttpServer())
      .get('/client')
      .auth('VALID_PROJECT', { type: 'bearer' })
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
  }

  @test('Given unlisted project id then return unauthorized')
  invalidProjectId() {
    return request(this.server)
      .get('/client')
      .auth('INVALID_PROJECT', { type: 'bearer' })
      .expect(HttpStatus.UNAUTHORIZED)
  }
}
