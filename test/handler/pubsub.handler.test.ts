import { Injectable, Module } from '@nestjs/common'
import { suite, test } from '@testdeck/jest'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { NestFirebaseModule } from '../../src'
import { OnMessage } from '../../src/decorator'
import { BaseTest } from '../base-test'

@Injectable()
class NeverCalledListener {
  @OnMessage('eventss')
  onMessage() { expect(false).toBeTruthy() }
}
@Injectable()
class RegexListener {
  @OnMessage('regex-*')
  onMessage(message: Message) {
    expect(message.json.id).toBe('regex-type')
  }
}
@Injectable()
class SimpleListener {
  @OnMessage('events')
  onMessage(message: Message) {
    expect(message.json.id).toBe('1AgP2VGe5MvX2eBnxxx')
  }
}

@Module({
  imports: [NestFirebaseModule],
  providers: [NeverCalledListener, RegexListener, SimpleListener]
})
class TestModule { }

@suite('[Decorator] On message decorator')
export class PubsubHandlerTest extends BaseTest {
  @test('Given message with subscription then invoke SimpleListener')
  async messageWithListener() {
    await this.run('events', TestModule, { id: '1AgP2VGe5MvX2eBnxxx' }, {})
  }

  @test('Given message with subscription using regex then invoke RegexListener')
  async messageWithRegexListener() {
    await this.run('regex-some-string', TestModule, { id: 'regex-type' }, {})
  }

  @test('Given message without subscription no listener should be invoked')
  async messageIgnore() {
    await this.run('never-topic', TestModule, {}, {})
    expect(true).toBeTruthy()
  }
}
