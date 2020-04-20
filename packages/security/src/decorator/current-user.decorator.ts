import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { getRequestFromContext } from '../util'

export const CurrentUser = createParamDecorator((params: any, context: ExecutionContext) => getRequestFromContext(context).user)
