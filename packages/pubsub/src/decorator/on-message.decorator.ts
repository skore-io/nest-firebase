import { SetMetadata } from "@nestjs/common";
import { MESSAGET_TOPIC, MESSAGE_ACTION, MESSAGE_TYPE } from "../constants";

export type FilterOptions = {
  /**
   * Specificy pubsub topic name
   * **accepts regex**
   */
  topic: string,
  /**
   * Specificy string expected in message.attributes.type
   * **accepts regex**
   */
  type?: string,
  /**
   * Specificy string expected in message.attributes.action
   * **accepts regex**
   */
  action?: string
}

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
 *    @OnMessage({ topic: 'events' })
 *    onMessage(message: Message): Promise<void> { }
 *  }
 * ```
 *
 * By pubsub topic and message type:
 * ```ts
 *  @Injectable()
 *  export class TopicAndMessageTypeListener {
 *
 *    @OnMessage({ topic: 'events', type: 'io.skore.events.user' })
 *    onMessage(message: Message): Promise<void> { }
 *  }
 * ```
 *
 * By pubsub topic, message type and action:
 * ```ts
 *  @Injectable()
 *  export class TopicAndMessageTypeListener {
 *
 *    @OnMessage({ topic: 'events', type: 'io.skore.events.user', action: 'created' })
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
export function OnMessage(filterOptions: FilterOptions) {
  return (
    target: Record<string, any> | Function,
    key?: string,
    descriptor?: any,
  ) => {
    if (filterOptions.action) {
      SetMetadata(MESSAGE_ACTION, `${filterOptions.topic}|${filterOptions.type}|${filterOptions.action}`)(target, key, descriptor)
    } else if (filterOptions.type) {
      SetMetadata(MESSAGE_TYPE, `${filterOptions.topic}|${filterOptions.type}`)(target, key, descriptor)
    } else {
      SetMetadata(MESSAGET_TOPIC, filterOptions.topic)(target, key, descriptor)
    }
  }
}
