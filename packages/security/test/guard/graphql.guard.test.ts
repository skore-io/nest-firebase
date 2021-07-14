import { HttpService, HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import request from 'supertest'
import { TestModule } from './test.module'

@suite('[Guard] Graphql Guard')
export class GraphqlGuardTest {
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

  @test('Given valid token on graphql query then return user id')
  async validToken() {
    const { body } = await request(this.server)
      .post('/graphql')
      .send({
        query: `{ user { id } }`,
      })
      .auth('SHOULD_ASSERT_OK', { type: 'bearer' })
      .expect(HttpStatus.OK)

    expect(body.data.user.id).toBe('1')
  }

  @test('Given invalid token on graphql query then return errors')
  async invalidToken() {
    const response = await request(this.server)
      .post('/graphql')
      .send({
        query: `{ user { id } }`,
      })
      .expect(HttpStatus.OK)

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toBe('Forbidden resource')
  }
}
