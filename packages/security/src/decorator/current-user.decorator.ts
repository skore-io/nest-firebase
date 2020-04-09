import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentUser = createParamDecorator(
  (
    params: { graphql: boolean } = { graphql: false },
    context: ExecutionContext,
  ) => {
    return params.graphql
      ? GqlExecutionContext.create(context).getContext().req.user
      : context.switchToHttp().getRequest().user
  },
)
