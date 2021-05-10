import * as request from 'supertest'
import { HttpService, HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { TestModule } from './test.module'

@suite('[Guard] Admin Guard')
export class AdminGuardTest {
  private server: any

  async before() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(HttpService)
      .useValue({
        get: (_path: string, params: any) => ({
          toPromise: () => {
            if (params.headers.Authorization !== 'SHOULD_ASSERT_OK')
              throw new Error('Invalid token')

            return Promise.resolve({ data: { id: 1, role: 'admin' } })
          },
        }),
      })
      .compile()

    const app = await module.createNestApplication().init()

    this.server = app.getHttpServer()
  }

  @test()
  'Given no token provided then return 403'() {
    return request(this.server)
      .get('/admin')
      .expect(HttpStatus.FORBIDDEN)
  }

  @test()
  'Given invalid token then return 403'() {
    return request(this.server)
      .get('/admin')
      .auth('invalid', { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN)
  }

  @test()
  async 'Given expert token then return 403'() {
    const module = await Test.createTestingModule({ imports: [TestModule] })
      .overrideProvider(HttpService)
      .useValue({
        get: (_path: string, params: any) => ({
          toPromise: () => (Promise.resolve({ data: { id: 1, role: 'expert' } })),
        }),
      })
      .compile()

    const app = await module.createNestApplication().init()

    return request(app.getHttpServer())
      .get('/admin')
      .auth('SHOULD_ASSERT_OK', { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN)
  }

  @test()
  'Given token sent without bearer then return 403'() {
    return request(this.server)
      .get('/admin')
      .set('Authorization', 'SHOULD_ASSERT_OK')
      .expect(HttpStatus.FORBIDDEN)
  }


  @test()
  async 'Given admin token then return 200'() {
    const response = await request(this.server)
      .get('/admin')
      .auth('SHOULD_ASSERT_OK', { type: 'bearer' })
      .expect(HttpStatus.OK)
    expect(response.body.id).toBe(1)
  }
}
