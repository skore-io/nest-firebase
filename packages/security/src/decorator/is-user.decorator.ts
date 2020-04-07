import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

export function IsUser() {
  return UseGuards(AuthGuard('user'))
}
