import { UseGuards } from "@nestjs/common";
import { ClientGuard } from "../guard";

export function IsClient() {
  return UseGuards(ClientGuard)
}
