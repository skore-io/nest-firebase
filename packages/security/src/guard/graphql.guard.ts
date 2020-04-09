import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpService,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class GraphqlGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context)

    const authHeader = req.headers.authorization as string

    if (!authHeader) {
      throw new BadRequestException('Authorization header not found.')
    }

    const [type, token] = authHeader.split(' ')

    if (type !== 'Bearer') {
      throw new BadRequestException(
        `Authentication type \'Bearer\' required. Found \'${type}\'`,
      )
    }

    const userAuthUrl = this.configService.get('USER_AUTH_URL')

    if (!userAuthUrl) {
      console.error('No authentication provider url')
      throw new InternalServerErrorException()
    }

    try {
      const user = await this.httpService
        .get(userAuthUrl, {
          headers: { Authorization: token },
        })
        .toPromise()

      req.user = user.data

      return true
    } catch (error) {
      console.error('Error authenticating user', error.message)
      throw new UnauthorizedException()
    }
  }
}
