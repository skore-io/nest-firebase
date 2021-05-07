import { ForbiddenException, HttpService, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Guard } from './guard'

@Injectable()
export class AdminGuard extends Guard {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super()
  }

  async authorizeToken(token: string) {
    return this.httpService
      .get(this.configService.get('USER_AUTH_URL'), {
        headers: { Authorization: token },
      })
      .toPromise()
      .then(({ data }) => {
        if (data.role !== 'admin') throw new ForbiddenException()

        return data
      })
  }
}
