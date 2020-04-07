import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export function IsClient() {
  return UseGuards(AuthGuard('client'))
}
