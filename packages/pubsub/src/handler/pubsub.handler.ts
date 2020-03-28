import { DiscoveredMethod, DiscoveredMethodWithMeta, DiscoveryService } from "@golevelup/nestjs-discovery";
import { Injectable, Logger } from "@nestjs/common";
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import * as flatMap from 'lodash.flatmap';
import { MESSAGET_TOPIC, MESSAGE_ACTION, MESSAGE_TYPE } from "../constants";

@Injectable()
export class PubsubHandler {
  private readonly logger = new Logger(PubsubHandler.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator
  ) { }

  /**
   * Handle messages from firebase lib.
   *
   * Fetch all providers with decorator: `@OnMessage()` and filter messages
   * according decorator specification
   *
   * Invokes all providers at same time promisifying all of them
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

    const providers = []

    providers.push(topicProviders.filter(provider => new RegExp(String(provider.meta)).test(topicResourceName)))

    if (message.attributes) {
      providers.push(typeProviders.filter(({ meta }) => {
        const [topic, type] = meta as string[]
        return topicResourceName === topic &&
          new RegExp(type).test(message.attributes.type)
      }))

      providers.push(actionProviders.filter(({ meta }) => {
        const [topic, type, action] = meta as string[]
        return topicResourceName === topic &&
          new RegExp(type).test(message.attributes.type) &&
          new RegExp(action).test(message.attributes.action)
      }))
    }

    const handlers = flatMap(providers)
      .map((handler: DiscoveredMethodWithMeta<unknown>) => handler.discoveredMethod)
      .map((discoveredMethod: DiscoveredMethod) => this.externalContextCreator.create(
        discoveredMethod.parentClass.instance,
        discoveredMethod.handler,
        discoveredMethod.methodName
      ))

    if (handlers.length === 0) {
      this.logger.log('No handlers found')
      return Promise.resolve()
    }

    return Promise.all(handlers.map(handler => handler(message, context)))
  }
}
