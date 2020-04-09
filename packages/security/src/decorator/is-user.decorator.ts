import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { GraphqlGuard } from '../guard'

export function IsUser(graphql: boolean = false) {
  return graphql ? UseGuards(GraphqlGuard) : UseGuards(AuthGuard('user'))
}
