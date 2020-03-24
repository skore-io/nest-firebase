import { SetMetadata } from "@nestjs/common";
import { MESSAGET_TOPIC, MESSAGE_ACTION, MESSAGE_TYPE } from "../constants";

export function OnMessage(topic: string, type?: string, action?: string) {
  return (
    target: Record<string, any> | Function,
    key?: string,
    descriptor?: any,
  ) => {
    SetMetadata(MESSAGET_TOPIC, topic)(target, key, descriptor)

    if (type) SetMetadata(MESSAGE_TYPE, type)(target, key, descriptor)
    if (action) SetMetadata(MESSAGE_ACTION, action)(target, key, descriptor)
  }
}
