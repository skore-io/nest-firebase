import { Injectable, Module } from '@nestjs/common'
import { suite, test } from '@testdeck/jest'
import * as firebaseFunctionsTest from 'firebase-functions-test'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { PubsubModule } from '../src'
import { OnMessage } from '../src/decorator'
import { Pubsub } from '../src/pubsub'
import { BaseTest } from './base-test'

@Injectable()
class MatchTypeAndActionListener {
  @OnMessage({ topic: 'events', type: 'io.skore.events.user', action: 'created' })
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('io.skore.events.user')
    expect(message.attributes.action).toBe('created')
  }
}
@Injectable()
class NeverCalledListener {
  @OnMessage({ topic: 'never', type: 'call', action: 'this' })
  onMessage() { expect(true).toBeFalsy() }
}
@Injectable()
class RegexTypeAndActionListener {
  @OnMessage({ topic: 'events', type: 'com.typeform.*', action: '.*assign' })
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('com.typeform.events.form')
    expect(message.attributes.action).toBe('reassigned')
  }
}
@Injectable()
class MultipleActionListener {
  @OnMessage({ topic: 'actions', type: 'io.action.2', action: 'action1|action2' })
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('io.action.2')
    expect(message.attributes.action).toBe('action2')
  }
}
@Module({
  imports: [PubsubModule],
  providers: [MatchTypeAndActionListener, MultipleActionListener, NeverCalledListener, RegexTypeAndActionListener]
})
class TestModule { }

@suite('[Handler] Pubsub Action Handler')
export class PubsubActionHandlerTest extends BaseTest {
  @test('Given message with subscription, type and action then invoke MatchTypeAndActionListener')
  async messageWithListener() {
    const fn = Pubsub.topic('events', TestModule)
    await firebaseFunctionsTest().wrap(fn)({ attributes: { type: 'io.skore.events.user', action: 'created' } })
  }

  @test('Given message with subscription type using regex then invoke ListenerWithRegexType')
  async messageWithRegexListener() {
    const fn = Pubsub.topic('events', TestModule)
    await firebaseFunctionsTest().wrap(fn)({ attributes: { type: 'com.typeform.events.form', action: 'reassigned' } })
  }

  @test('Given listener with multiple actions then invoke MultipleActionListener')
  async multipleActionListener() {
    const fn = Pubsub.topic('actions', TestModule)
    await firebaseFunctionsTest().wrap(fn)({ attributes: { type: 'io.action.2', action: 'action2' } })
  }

  @test('Given message without attributes then no listener called')
  async messageWithoutListener() {
    const fn = Pubsub.topic('never', TestModule)
    await firebaseFunctionsTest().wrap(fn)({})
    expect(true).toBeTruthy()
  }
}
