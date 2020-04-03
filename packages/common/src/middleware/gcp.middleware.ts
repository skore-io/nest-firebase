import { Injectable, InternalServerErrorException, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'

/**
 * Middleware to validate requests from GCP
 *
 * **Requires ConfigModule and OAuth2Client provider configured**
 *
 * How to use:
 *
 * To validate request coming from GCP (cloud tasks for example)
 * do the following:
 *
 * ```typescript
 * @Module({
 *  controllers: [TaskController],
 *  imports: [ConfigModule.forRoot()],
 *  providers: [{
 *    provide: OAuth2Client,
 *    useFactory: () => new OAuth2Client(process.env.GCP_MIDDLEWARE_AUDIENCE)
 *  }]
 * })
 * class TestModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer.apply(GCPMiddleware).forRoutes('tasks')
 *   }
 * }
 * ```
 *
 * In this example all requests to `/tasks` will validate authorization token
 * from gcp.
 *
 * **Make sure that in your `.env` file has `GCP_MIDDLEWARE_AUDIENCE` configured**
 */
@Injectable()
export class GCPMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService,
    private readonly oAuth2Client: OAuth2Client) { }

  async use(req: any, res: any, next: () => void) {
    const { authorization } = req.headers

    if (!authorization) throw new UnauthorizedException()

    const [, idToken] = authorization.split(' ')
    const audience = this.configService.get('GCP_MIDDLEWARE_AUDIENCE')

    if (!audience) {
      console.error('No GCP_MIDDLEWARE_AUDIENCE provided')
      throw new InternalServerErrorException()
    }

    try {
      await this.oAuth2Client.verifyIdToken({ idToken, audience })
      next()
    } catch (error) {
      console.error('Error authenticating gcp call', error.message)
      throw new UnauthorizedException()
    }
  }
}
