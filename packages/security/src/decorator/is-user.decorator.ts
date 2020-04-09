import { UseGuards } from '@nestjs/common'
import { GraphqlGuard, UserGuard } from '../guard'

export function IsUser(params: { graphql: boolean } = { graphql: false }) {
  return params.graphql ? UseGuards(GraphqlGuard) : UseGuards(UserGuard)
}
