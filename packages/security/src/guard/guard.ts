import { CanActivate, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export abstract class Guard implements CanActivate {
  constructor(private readonly graphql: boolean = false) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.requestFromContext(context)

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

  private requestFromContext(context: ExecutionContext): any {
    return this.graphql
      ? GqlExecutionContext.create(context).getContext().req
      : context.switchToHttp().getRequest()
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
