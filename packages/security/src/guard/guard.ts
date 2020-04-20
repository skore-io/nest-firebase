import { CanActivate, ExecutionContext } from '@nestjs/common'
import { getRequestFromContext } from '../util'

export abstract class Guard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = getRequestFromContext(context)

    const token = this.authorizationHeader(request.headers)

    if (!token) return false

    try {
      const response = await this.authorizeToken(token)
      request.user = response
      return true
    } catch (error) {
      return false
    }
  }

  private authorizationHeader(headers: any): string {
    const authHeader = headers.authorization as string

    if (!authHeader) {
      console.error('Authorization header not found.')
      return null
    }

    const [type, token] = authHeader.split(' ')

    if (type !== 'Bearer') {
      console.error(
        `Authentication type \'Bearer\' required. Found \'${type}\'`,
      )
      return null
    }

    return token
  }

  abstract authorizeToken(token: string): any
}
