import { SetMetadata } from "@nestjs/common";
import { MESSAGET_TOPIC, MESSAGE_ACTION, MESSAGE_TYPE } from "../constants";

/**
 * Decorator that marks a provider method as listener of pubsub messages
 *
 * When using you can specify your filter in three ways:
 *
 * - By pubsub topic:
 * ```ts
 *  @Injectable()
 *  export class TopicListener {
 *
 *    @OnMessage('events')
 *    onMessage(message: Message): Promise<void> { }
 *  }
 * ```
 *
 * By pubsub topic and message type:
 * ```ts
 *  @Injectable()
 *  export class TopicAndMessageTypeListener {
 *
 *    @OnMessage('events', 'io.skore.events.user')
 *    onMessage(message: Message): Promise<void> { }
 *  }
 * ```
 *
 * By pubsub topic, message type and action:
 * ```ts
 *  @Injectable()
 *  export class TopicAndMessageTypeListener {
 *
 *    @OnMessage('events', 'io.skore.events.user', 'created')
 *    onMessage(message: Message): Promise<void> { }
 *  }
 * ```
 *
 * It is possible to insert regex in every fields
 *
 * @param topic - Pubsub topic name
 * @param type - message.attributes.type
 * @param action - message.attributes.action
 */
export function OnMessage(topic: string, type?: string, action?: string) {
  return (
    target: Record<string, any> | Function,
    key?: string,
    descriptor?: any,
  ) => {
    if (action) {
      SetMetadata(MESSAGE_ACTION, `${topic}|${type}|${action}`)(target, key, descriptor)
    } else if (type) {
      SetMetadata(MESSAGE_TYPE, `${topic}|${type}`)(target, key, descriptor)
    } else {
      SetMetadata(MESSAGET_TOPIC, topic)(target, key, descriptor)
    }
  }
}
