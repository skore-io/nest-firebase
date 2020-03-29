import { HttpService, Injectable, InternalServerErrorException, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * Middleware to fetch user from given url
 *
 * **Requires HttpModule and ConfigModule configured**
 *
 * How to use:
 *
 * To inject user and validate token in `/users` routes
 * do the following:
 *
 * ```typescript
 * @Module({
 *  imports: [HttpModule, ConfigModule.forRoot()],
 *  controllers: [UserController]
 * })
 * class TestModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer.apply(UserMiddleware).forRoutes('users')
 *   }
 * }
 * ```
 *
 * Make sure that in your `.env` file has `USER_AUTH_URL`
 * configured
 */
@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) { }

  async use(req: any, res: any, next: () => void) {
    const { authorization } = req.headers

    if (!authorization) {
      console.error('No authorization header present')
      throw new UnauthorizedException()
    }

    const userAuthUrl = this.configService.get('USER_AUTH_URL')

    if (!userAuthUrl) {
      console.error('No authentication provider url')
      throw new InternalServerErrorException()
    }

    try {
      const user = await this.httpService.get(this.configService.get('USER_AUTH_URL'), {
        headers: {
          Authorization: authorization,
        },
      }).toPromise()

      req.user = user.data

      next()
    } catch (error) {
      console.error('Error authenticating user', error.message)
      throw new UnauthorizedException()
    }
  }
}
