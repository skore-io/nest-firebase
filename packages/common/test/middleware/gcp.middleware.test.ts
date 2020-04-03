import { Controller, Get, HttpCode, HttpModule, HttpStatus, MiddlewareConsumer, Module, NestModule, Req } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { suite, test } from '@testdeck/jest';
import { OAuth2Client } from 'google-auth-library';
import * as request from 'supertest';
import { GCPMiddleware } from '../../src';

@Controller('never')
class NeverCalledController {
  @Get() @HttpCode(200)
  neverCalled() { expect(false).toBeTruthy() }
}
@Controller('')
class CalledController {
  @Get() @HttpCode(200)
  neverCalled() { expect(true).toBeTruthy() }
}
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({envFilePath: 'test/.env'})
  ],
  controllers: [CalledController, NeverCalledController],
  providers: [{provide: OAuth2Client, useFactory: () => new OAuth2Client()}]
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { consumer.apply(GCPMiddleware).forRoutes('*') }
}

@suite('[Middleware] GCP Middleware')
export class GCPMiddlewareTest {
  private server: any

  async before() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(OAuth2Client)
      .useValue({
        verifyIdToken: ({ idToken }) => {
          if (idToken !== 'SHOULD_ASSERT_OK') throw new Error('Invalid token')
          return true
        },
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
      .useValue({ get: () => null })
      .compile()

    const app = await module.createNestApplication().init()

    return request(app.getHttpServer()).get('/').auth('SHOULD_ASSERT_OK', { type: 'bearer' })
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
