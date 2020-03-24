import { EventContext } from "firebase-functions"
import { Message } from "firebase-functions/lib/providers/pubsub"

export abstract class BaseTest {
  before() {
    expect.hasAssertions()
  }

  protected message(type = 'io.skore.events.user', companyId = '114'): Message {
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      json: { company_id: companyId, batch_id: '1AgP2VGe5MvX2eBnxxx' },
      attributes: { type, action: 'indexed' },
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
