import {
  HttpService,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-http-bearer'

@Injectable()
export class UserGuard extends PassportStrategy(Strategy, 'user') {
  constructor(private readonly httpService: HttpService) {
    super()
  }

  async validate(token: string) {
    const userAuthUrl = process.env.USER_AUTH_URL

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

      return user.data
    } catch (error) {
      console.error('Error authenticating user', error.message)
      throw new UnauthorizedException()
    }
  }
}
