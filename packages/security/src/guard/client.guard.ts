import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'
import { Guard } from './guard'

@Injectable()
export class ClientGuard extends Guard {
  constructor(
    private readonly authClient: OAuth2Client,
    private readonly configService: ConfigService,
  ) {
    super()
  }

  async authorizeToken(token: string) {
    const ticket = await this.authClient.verifyIdToken({
      idToken: token,
      audience: this.configService.get('OAUTH_AUDIENCE'),
    })

    const payload = ticket.getPayload()

    if (!payload.email_verified || !this.projectAllowed(payload.email)) {
      console.error('Service account %o not allowed', payload)
      throw new UnauthorizedException()
    }

    return payload
  }

  private projectAllowed(email: string) {
    const [projectId] = email.split('@')

    const allowedProjects = this.configService
      .get('OAUTH_ALLOWED_PROJECTS', '')
      .split(',')

    return allowedProjects.some(allowedProject => allowedProject === projectId)
  }
}
