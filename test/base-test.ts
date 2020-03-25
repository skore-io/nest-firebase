import { NestFactory } from "@nestjs/core"
import { pubsub } from "firebase-functions"
import * as firebaseFunctionsTest from 'firebase-functions-test'
import { PubsubHandler } from "../src"

export abstract class BaseTest {
  before() {
    expect.hasAssertions()
  }

  protected run(topic: string, module: any, message: any, attributes: any) {
    const fn = pubsub.topic(topic).onPublish(async (message, context) => {
      const handler = (await NestFactory.create(module)).get(PubsubHandler)
      return handler.handle(message, context)
    })

    return firebaseFunctionsTest().wrap(fn)({
      json: message,
      attributes
    })
  }
}
