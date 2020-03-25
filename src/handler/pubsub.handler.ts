import { DiscoveryService } from "@golevelup/nestjs-discovery";
import { Injectable, Logger } from "@nestjs/common";
import { flatMap } from 'lodash';
import { MESSAGET_TOPIC, MESSAGE_ACTION, MESSAGE_TYPE } from "../constants";

@Injectable()
export class PubsubHandler {
  private readonly logger = new Logger(PubsubHandler.name);

  constructor(private readonly discoveryService: DiscoveryService) { }

  /**
   * Handle messages from firebase lib.
   *
   * Receives messages from pubsub through firebase lib and create a nest
   * application ctx
   *
   * Fetch all providers with decorators: `@OnMessage()` and filter messages
   * according decorator specification
   *
   * Invokes all providers at same time promisifying all of them
   *
   * How to use:
   *
   * In your index.ts file:
   * ```typescript
   * export const onMessage = pubsub.topic('events').handler(PubsubHandler.handle)
   * ```
   *
   * @param message - Message from pubsub
   * @param context - EventContext from pubsub
   */
  async handle(message: any, context: any): Promise<any> {
    const topicResourceName = context.resource.name.split('/')[3]

    this.logger.log(`Incoming message from topic=${topicResourceName}`)

    const [topicProviders, typeProviders, actionProviders] = await Promise.all([
      this.discoveryService.providerMethodsWithMetaAtKey(MESSAGET_TOPIC),
      this.discoveryService.providerMethodsWithMetaAtKey(MESSAGE_TYPE),
      this.discoveryService.providerMethodsWithMetaAtKey(MESSAGE_ACTION)
    ])

    const handlers = []

    handlers.push(topicProviders.filter(provider => new RegExp(String(provider.meta)).test(topicResourceName)))

    handlers.push(typeProviders.filter(({ meta }) => {
      const [topic, type] = String(meta).split('|')
      return topicResourceName === topic &&
        new RegExp(type).test(message.attributes.type)
    }))

    handlers.push(actionProviders.filter(({ meta }) => {
      const [topic, type, action] = String(meta).split('|')
      return topicResourceName === topic &&
        new RegExp(type).test(message.attributes.type) &&
        new RegExp(action).test(message.attributes.action)
    }))

    const providers = flatMap(handlers)

    if (providers.length === 0) {
      this.logger.log('No handlers found')
      return Promise.resolve()
    }

    this.logger.log(`Invoking handlers=${providers.map(h => h.discoveredMethod.parentClass.name).toString()}`)

    return Promise.all(providers.map(handler => handler.discoveredMethod.handler(message)))
  }
}
