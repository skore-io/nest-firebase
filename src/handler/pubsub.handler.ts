import { DiscoveredMethodWithMeta, DiscoveryService } from "@golevelup/nestjs-discovery";
import { NestFactory } from "@nestjs/core";
import { EventContext } from "firebase-functions";
import { Message } from "firebase-functions/lib/providers/pubsub";
import { MESSAGET_TOPIC } from "../constants";

export class PubsubHandler {
  private static classNamePredicate = (p1: DiscoveredMethodWithMeta<unknown>, p2: DiscoveredMethodWithMeta<unknown>) =>
    p1.discoveredMethod.parentClass.name === p2.discoveredMethod.parentClass.name

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

    const providers = await discoveryService.providerMethodsWithMetaAtKey(MESSAGET_TOPIC)

    const eventsHandler = providers.filter(provider => provider.meta === topicResourceName)

    if (eventsHandler.length === 0) {
      console.info('No handlers found')
      return Promise.resolve()
    }

    console.info('Invoking handlers=%s', eventsHandler.map(h => h.discoveredMethod.parentClass.name))

    return Promise.all(eventsHandler.map(handler => handler.discoveredMethod.handler(message)))
  }
}
