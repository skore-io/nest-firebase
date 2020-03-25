import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery'
import { Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { OnMessage } from '../../src/decorator'
import { PubsubHandler } from '../../src/handler'
import { BaseTest } from '../base-test'

@Injectable()
class ListenerWithFullTypeAndAction {
  @OnMessage('events', 'io.skore.events.user', 'created')
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('io.skore.events.user')
    expect(message.attributes.action).toBe('created')
  }
}
@Injectable()
class ListenerWithRegexTypeAndAction {
  @OnMessage('events', 'com.typeform.*', '.*assign')
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('com.typeform.events.form')
    expect(message.attributes.action).toBe('reassigned')
  }
}
@Injectable()
class NeverCalledListener {
  @OnMessage('never', 'call', 'this')
  onMessage() { expect(true).toBeFalsy() }
}
@Module({
  imports: [DiscoveryModule],
  providers: [ListenerWithFullTypeAndAction, ListenerWithRegexTypeAndAction, NeverCalledListener]
})
class TestModule { }

@suite('[Handler] Pubsub Action Handler')
export class PubsubActionHandlerTest extends BaseTest {
  private discoveryService: DiscoveryService

  async before() {
    const moduleRef = await Test.createTestingModule({
      imports: [TestModule]
    }).compile()

    this.discoveryService = moduleRef.get<DiscoveryService>(DiscoveryService)
  }

  @test('Given message with subscription, type and action then invoke ListenerWithFullTypeAndAction')
  async messageWithListener() {
    await PubsubHandler.handle(
      this.message('io.skore.events.user', '115', 'created'),
      this.context('events'),
      this.discoveryService
    )
  }

  @test('Given message with subscription type using regex then invoke ListenerWithRegexType')
  async messageWithRegexListener() {
    await PubsubHandler.handle(
      this.message('com.typeform.events.form', '111', 'reassigned'),
      this.context('events'),
      this.discoveryService
    )
  }

  @test('Given message with type not expected then no listener called')
  async messageWithoutListener() {
    await PubsubHandler.handle(
      this.message('not-expected-type', 'asskldakdadja'),
      this.context('events'),
      this.discoveryService
    )
    expect(true).toBeTruthy()
  }
}
