import { NestFactory } from '@nestjs/core'
import { EventContext, pubsub } from 'firebase-functions'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { PubsubHandler } from './handler'
import { Logger } from '@nestjs/common'

/**
 * Encapsulate firebase function invocation
 * creates nest application and delegates to
 * PubsubHandler class
 */
export class Pubsub {

  /**
   * Returns a `CloudFunction` which should be exported in `index.ts` file
   *
   * Every time a function is invoked it creates a nest application with:
   *
   * ```ts
   * NestFactory.createApplicationContext(module)
   * ```
   *
   * Where module is you nest module **with `NestFirebaseModule` imported**
   *
   * How to use:
   *
   * In your `index.ts` at root folder:
   *
   * ```ts
   * export const onMessage = Pubsub.topic('events', AppModule)
   * ```
   *
   * @param topic - Pubsub topic to listen for messages
   * @param module - Nest application module with NestFirebaseModule imported
   */
  static topic(topic: string, module: any) {
    return pubsub.topic(topic).onPublish(async (message: Message, context: EventContext) => {
        const nest = await NestFactory.createApplicationContext(module)

        try {
          const handler = nest.get(PubsubHandler)

          return handler.handle(message, context)
        } catch (error) {
          new Logger(Pubsub.name).error("PubsubHadler provider not found, make sure that you imported 'NestFirebaseModule' into your module")
          throw new Error('PubsubHadler provider not found')
        }
    })
  }
}
