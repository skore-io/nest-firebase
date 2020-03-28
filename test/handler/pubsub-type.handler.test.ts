import { Injectable, Module } from '@nestjs/common'
import { suite, test } from '@testdeck/jest'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { NestFirebaseModule } from '../../src'
import { OnMessage } from '../../src/decorator'
import { BaseTest } from '../base-test'

@Injectable()
class MatchTypeListener {
  @OnMessage({ topic: 'events', type: 'io.skore.events.user' })
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('io.skore.events.user')
  }
}
@Injectable()
class NeverCalledListener {
  @OnMessage({ topic: 'never', type: 'io.skore.events.user' })
  onMessage() { expect(false).toBeTruthy() }
}
@Injectable()
class RegexTypeListener {
  @OnMessage({ topic: 'events', type: 'com.typeform.*' })
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('com.typeform.events.form')
  }
}
@Module({
  imports: [NestFirebaseModule],
  providers: [MatchTypeListener, NeverCalledListener, RegexTypeListener]
})
class TestModule { }

@suite('[Handler] Pubsub Type Handler')
export class PubsubTypeHandlerTest extends BaseTest {
  @test('Given message with subscription and type then invoke ListenerWithFullType')
  async messageWithListener() {
    await this.run('events', TestModule, {}, { type: 'io.skore.events.user' })
  }

  @test('Given message with subscription type using regex then invoke ListenerWithRegexType')
  async messageWithRegexListener() {
    await this.run('events', TestModule, {}, { type: 'com.typeform.events.form' })
  }

  @test('Given message with type not expected then no listener called')
  async messageWithoutListener() {
    await this.run('events', TestModule, {}, { type: 'never.call.listener' })
    expect(true).toBeTruthy()
  }
}
