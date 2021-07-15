import { HttpService, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { plainToClass } from 'class-transformer'
import { User } from '../domain'
import { Guard } from './guard'

@Injectable()
export class UserGuard extends Guard {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super()
  }

  async authorizeToken(token: string): Promise<User> {
    const { data } = await this.httpService
      .get(this.configService.get('USER_AUTH_URL'), {
        headers: { Authorization: token },
      })
      .toPromise()

    return plainToClass(User, data, { excludeExtraneousValues: true })
  }
}
