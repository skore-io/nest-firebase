import { Injectable, Module } from '@nestjs/common'
import { suite, test } from '@testdeck/jest'
import * as firebaseFunctionsTest from 'firebase-functions-test'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { PubsubModule } from '../src'
import { OnMessage } from '../src/decorator'
import { Pubsub } from '../src/pubsub'
import { BaseTest } from './base-test'

@Injectable()
class NeverCalledListener {
  @OnMessage({ topic: 'eventss'})
  onMessage() { expect(false).toBeTruthy() }
}
@Injectable()
class RegexListener {
  @OnMessage({ topic: 'regex-*'})
  onMessage(message: Message) {
    expect(message.json.id).toBe('regex-type')
  }
}
@Injectable()
class SimpleListener {
  @OnMessage({ topic: 'events'})
  onMessage(message: Message) {
    expect(message.json.id).toBe('1AgP2VGe5MvX2eBnxxx')
  }
}
@Injectable()
class Dependency {
  assert() { return 'provided class' }
}
@Injectable()
class WithDependencyListener {
  constructor(private readonly dependency: Dependency) { }
  @OnMessage({ topic: 'dependency'})
  onMessage(message: Message) {
    expect(message.json.id).toBe('dep')
    expect(this.dependency.assert()).toBe('provided class')
  }
}

@Module({
  imports: [PubsubModule],
  providers: [Dependency, NeverCalledListener, RegexListener, SimpleListener, WithDependencyListener]
})
class TestModule { }
@Module({ })
class NotValidModule { }

@suite('[Decorator] On message decorator')
export class PubsubHandlerTest extends BaseTest {
  @test('Given message with subscription then invoke WithDependencyListener')
  async listenerWithDep() {
    const fn = Pubsub.topic('dependency', TestModule, {
      memory: '256MB',
    })
    await firebaseFunctionsTest().wrap(fn)({ json: { id: 'dep' } })
  }

  @test('Given message with subscription then invoke SimpleListener')
  async messageWithListener() {
    const fn = Pubsub.topic('events', TestModule)
    await firebaseFunctionsTest().wrap(fn)({ json: { id: '1AgP2VGe5MvX2eBnxxx' } })
  }

  @test('Given message with subscription using regex then invoke RegexListener')
  async messageWithRegexListener() {
    const fn = Pubsub.topic('regex-some-string', TestModule)
    await firebaseFunctionsTest().wrap(fn)({ json: { id: 'regex-type' } })
  }

  @test('Given message without subscription no listener should be invoked')
  async messageIgnore() {
    const fn = Pubsub.topic('never-topic', TestModule)
    await firebaseFunctionsTest().wrap(fn)({})
    expect(true).toBeTruthy()
  }

  @test('Given module without NestFirebaseModule then throw error')
  async notValidModule() {
    const fn = Pubsub.topic('never-topic', NotValidModule)

    try {
      await firebaseFunctionsTest().wrap(fn)({})
    } catch (error) {
      expect(error.message).toBe('PubsubHadler provider not found')
    }
  }
}
