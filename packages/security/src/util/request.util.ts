import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const getRequestFromContext = (context: ExecutionContext) => {
  const graphqlReq = GqlExecutionContext.create(context).getContext().req

  return !!graphqlReq ? graphqlReq : context.switchToHttp().getRequest()
}
