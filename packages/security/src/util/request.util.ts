import { ExecutionContext } from "@nestjs/common";

export const getRequestFromContext = (context: ExecutionContext) => {
  // https://github.com/nestjs/graphql/blob/c5dd5b3cc7dc1ec86fca5ff3e7b3e7998da7a729/lib/services/gql-execution-context.ts#L33
  // Using this to avoid graphql deps in project
  const graphqlReq = context.getArgByIndex(2).req

  return !!graphqlReq ? graphqlReq : context.switchToHttp().getRequest()
}
