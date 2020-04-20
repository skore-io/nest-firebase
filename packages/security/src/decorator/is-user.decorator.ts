import { UseGuards } from '@nestjs/common'
import { UserGuard } from '../guard'

export function IsUser() {
  return UseGuards(UserGuard)
}
