import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery'
import { Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { OnMessage } from '../../src/decorator'
import { PubsubHandler } from '../../src/handler'
import { BaseTest } from '../base-test'

@Injectable()
class ListenerWithFullType {
  @OnMessage('events', 'io.skore.events.user')
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('io.skore.events.user')
    expect(message.json.companyId).toBe('115')
  }
}
@Injectable()
class ListenerWithRegexType {
  @OnMessage('events', 'com.typeform.*')
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('com.typeform.events.form')
    expect(message.json.id).toBe('123123')
  }
}
@Module({
  imports: [DiscoveryModule],
  providers: [ListenerWithFullType, ListenerWithRegexType]
})
class TestModule { }

@suite('[Handler] Pubsub Type Handler')
export class PubsubTypeHandlerTest extends BaseTest {
  private discoveryService: DiscoveryService

  async before() {
    const moduleRef = await Test.createTestingModule({
      imports: [TestModule]
    }).compile()

    this.discoveryService = moduleRef.get<DiscoveryService>(DiscoveryService)
  }

  @test('Given message with subscription and type then invoke ListenerWithFullType')
  async messageWithListener() {
    await PubsubHandler.handle(
      this.message('io.skore.events.user', '115'),
      this.context('events'),
      this.discoveryService
    )
  }

  @test('Given message with subscription type using regex then invoke ListenerWithRegexType')
  async messageWithRegexListener() {
    await PubsubHandler.handle(
      this.message('com.typeform.events.form', '111', 'created', '123123'),
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
