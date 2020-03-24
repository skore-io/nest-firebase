import { DiscoveryService } from "@golevelup/nestjs-discovery";
import { NestFactory } from "@nestjs/core";
import { EventContext } from "firebase-functions";
import { Message } from "firebase-functions/lib/providers/pubsub";
import { MESSAGET_TOPIC, MESSAGE_ACTION, MESSAGE_TYPE } from "../constants";
import {flatMap} from 'lodash'

export class PubsubHandler {
  static async handle(message: Message, context: EventContext, service?: DiscoveryService): Promise<any> {
    const topicResourceName = context.resource.name.split('/')[3]

    console.info('Incoming message from topic=%s', topicResourceName)

    let discoveryService: DiscoveryService

    if (service) {
      discoveryService = service
    } else {
      const nest = await NestFactory.createApplicationContext(module)
      discoveryService = nest.get(DiscoveryService)
    }

    const [topicProviders, typeProviders, actionProviders] = await Promise.all([
      discoveryService.providerMethodsWithMetaAtKey(MESSAGET_TOPIC),
      discoveryService.providerMethodsWithMetaAtKey(MESSAGE_TYPE),
      discoveryService.providerMethodsWithMetaAtKey(MESSAGE_ACTION)
    ])

    const handlers = []

    handlers.push(topicProviders.filter(provider => provider.meta === topicResourceName))

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
      console.info('No handlers found')
      return Promise.resolve()
    }

    console.info('Invoking handlers=%s', providers.map(h => h.discoveredMethod.parentClass.name))

    return Promise.all(providers.map(handler => handler.discoveredMethod.handler(message)))
  }
}
