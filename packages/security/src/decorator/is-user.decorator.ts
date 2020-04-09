import { UseGuards } from '@nestjs/common'
import { GraphqlGuard, UserGuard } from '../guard'

export function IsUser(graphql: boolean = false) {
  return graphql ? UseGuards(GraphqlGuard) : UseGuards(UserGuard)
}
