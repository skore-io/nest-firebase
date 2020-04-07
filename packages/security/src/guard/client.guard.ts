import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { OAuth2Client } from 'google-auth-library'
import { Strategy } from 'passport-http-bearer'

@Injectable()
export class ClientGuard extends PassportStrategy(Strategy, 'client') {
  constructor(
    private readonly authClient: OAuth2Client,
    private readonly configService: ConfigService,
  ) {
    super()
  }

  async validate(token: string) {
    const audience = this.configService.get('OAUTH_AUDIENCE')

    if (!audience) {
      console.error('No audience provided')
      throw new InternalServerErrorException()
    }

    try {
      const ticket = await this.authClient.verifyIdToken({
        idToken: token,
        audience,
      })

      const payload = ticket.getPayload()

      if (!payload.email_verified || !this.isAllowedProject(payload.email)) {
        console.error('Service account %o not allowed', payload)
        throw new UnauthorizedException()
      }

      return payload
    } catch (error) {
      console.error('Error authenticating client', error.message)
      throw new UnauthorizedException()
    }
  }

  private isAllowedProject(email: string) {
    const domain = email.split('@')[1]

    const [projectId] = domain.split('.')

    const allowedProjects = this.configService
      .get('OAUTH_ALLOWED_PROJECTS', '')
      .split(',')

    return allowedProjects.some(allowedProject => allowedProject === projectId)
  }
}
