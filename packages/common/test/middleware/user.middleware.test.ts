import { Controller, Get, HttpCode, HttpModule, HttpService, HttpStatus, MiddlewareConsumer, Module, NestModule, Req } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { suite, test } from '@testdeck/jest';
import * as request from 'supertest';
import { UserMiddleware } from '../../src';

@Controller('never')
class NeverCalledController {
  @Get() @HttpCode(200)
  neverCalled() { expect(false).toBeTruthy() }
}
@Controller('')
class CalledListener {
  @Get() @HttpCode(200)
  neverCalled(@Req() req:any) { expect(req.user.id).toBe('10') }
}
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({envFilePath: 'test/.env'})
  ],
  controllers: [CalledListener, NeverCalledController]
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { consumer.apply(UserMiddleware).forRoutes('*') }
}

@suite('[Middleware] User Middleware')
export class UserMiddlewareTest {
  private server: any

  async before() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(HttpService)
      .useValue({
        get: (path: string, params: any) => ({toPromise: () => {
          if (params.headers.Authorization !== 'Bearer SHOULD_ASSERT_OK') throw new Error('Invalid token')
          return { data: { id: '10' } }
        }})
      })
      .compile()

    const app = await module.createNestApplication().init()

    this.server = app.getHttpServer()
  }

  @test('Given no token provided then return 401')
  async invocationWithoutToken() {
    return request(this.server).get('/never').expect(HttpStatus.UNAUTHORIZED)
  }

  @test('Given invalid token then return 401')
  async invocationWithInvalidToken() {
    return request(this.server).get('/never').auth('invalid', { type: 'bearer' }).expect(HttpStatus.UNAUTHORIZED)
  }

  @test('Given valid token then return 200')
  async invocationWithValidToken() {
    return request(this.server).get('/').auth('SHOULD_ASSERT_OK', { type: 'bearer' }).expect(HttpStatus.OK)
  }

  @test('Given module without user auth provider url the return 500')
  async moduleMisconfigured() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(ConfigService)
      .useValue({ get: (path: string) => null })
      .compile()

    const app = await module.createNestApplication().init()

    return request(app.getHttpServer()).get('/').auth('SHOULD_ASSERT_OK', { type: 'bearer' })
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
