import {
  Controller,
  Get,
  HttpModule,
  HttpService,
  HttpStatus,
  Module,
} from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import * as request from 'supertest'
import { CurrentUser, IsUser, BearerGuard } from '../../src'

@Controller()
class AuthedController {
  @Get()
  @IsUser()
  auth(@CurrentUser() user: any) {
    return user
  }
}
@Module({
  imports: [ConfigModule.forRoot({ envFilePath: 'test/.env' }), HttpModule],
  controllers: [AuthedController],
  providers: [BearerGuard],
})
class TestModule {}

@suite('[Guard] Bearer Guard')
export class BearerGuardTest {
  private server: any

  async before() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(HttpService)
      .useValue({
        get: (path: string, params: any) => ({
          toPromise: () => {
            if (params.headers.Authorization !== 'SHOULD_ASSERT_OK')
              throw new Error('Invalid token')
            return { data: { id: 1 } }
          },
        }),
      })
      .compile()

    const app = await module.createNestApplication().init()

    this.server = app.getHttpServer()
  }

  @test('Given no token provided then return 401')
  async invocationWithoutToken() {
    return request(this.server)
      .get('/')
      .expect(HttpStatus.UNAUTHORIZED)
  }

  @test('Given invalid token then return 401')
  async invocationWithInvalidToken() {
    return request(this.server)
      .get('/')
      .auth('invalid', { type: 'bearer' })
      .expect(HttpStatus.UNAUTHORIZED)
  }

  @test('Given valid token then return 200')
  async invocationWithValidToken() {
    const response = await request(this.server)
      .get('/')
      .auth('SHOULD_ASSERT_OK', { type: 'bearer' })
      .expect(HttpStatus.OK)
    expect(response.body.id).toBe(1)
  }

  @test('Given module without user auth provider url the return 500')
  async moduleMisconfigured() {
    delete process.env.USER_AUTH_URL

    return request(this.server)
      .get('/')
      .auth('SHOULD_ASSERT_OK', { type: 'bearer' })
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
