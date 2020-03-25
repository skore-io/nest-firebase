import { Injectable, Module } from '@nestjs/common'
import { suite, test } from '@testdeck/jest'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { NestFirebaseModule } from '../../src'
import { OnMessage } from '../../src/decorator'
import { BaseTest } from '../base-test'

@Injectable()
class MatchTypeAndActionListener {
  @OnMessage('events', 'io.skore.events.user', 'created')
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('io.skore.events.user')
    expect(message.attributes.action).toBe('created')
  }
}
@Injectable()
class NeverCalledListener {
  @OnMessage('never', 'call', 'this')
  onMessage() { expect(true).toBeFalsy() }
}
@Injectable()
class RegexTypeAndActionListener {
  @OnMessage('events', 'com.typeform.*', '.*assign')
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('com.typeform.events.form')
    expect(message.attributes.action).toBe('reassigned')
  }
}
@Module({
  imports: [NestFirebaseModule],
  providers: [MatchTypeAndActionListener, NeverCalledListener, RegexTypeAndActionListener]
})
class TestModule { }

@suite('[Handler] Pubsub Action Handler')
export class PubsubActionHandlerTest extends BaseTest {
  @test('Given message with subscription, type and action then invoke MatchTypeAndActionListener')
  async messageWithListener() {
    await this.run('events', TestModule, {}, { type: 'io.skore.events.user', action: 'created' })
  }

  @test('Given message with subscription type using regex then invoke ListenerWithRegexType')
  async messageWithRegexListener() {
    await this.run('events', TestModule, {}, { type: 'com.typeform.events.form', action: 'reassigned' })
  }

  @test('Given message with type not expected then no listener called')
  async messageWithoutListener() {
    await this.run('never', TestModule, {}, { type: 'call', action: 'that' })
    expect(true).toBeTruthy()
  }
}
