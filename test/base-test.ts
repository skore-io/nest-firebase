import { EventContext } from "firebase-functions"
import { Message } from "firebase-functions/lib/providers/pubsub"

export abstract class BaseTest {
  before() {
    expect.hasAssertions()
  }

  protected message(type = 'io.skore.events.user', companyId = '114', action = 'indexed', id = '1AgP2VGe5MvX2eBnxxx'): Message {
    return {
      json: { companyId, id },
      attributes: { type, action },
    } as unknown as Message
  }

  protected context(topicName: string): EventContext {
    return {
      resource: {
        name: `projects/test/topics/${topicName}`
      }
    } as EventContext
  }
}
