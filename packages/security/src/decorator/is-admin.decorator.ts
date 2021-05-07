import { UseGuards } from '@nestjs/common'
import { AdminGuard } from '../guard'

export function IsAdmin() {
  return UseGuards(AdminGuard)
}
