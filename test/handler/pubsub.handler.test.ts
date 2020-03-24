import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery'
import { Injectable, Module } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { Message } from 'firebase-functions/lib/providers/pubsub'
import { OnMessage } from '../../src/decorator'
import { PubsubHandler } from '../../src/handler'
import { BaseTest } from '../base-test'

@Injectable()
class NeverCalledListener {
  @OnMessage('eventss')
  onMessage() { expect(false).toBeTruthy() }
}
@Injectable()
class SimpleListener {
  @OnMessage('events')
  onMessage(message: Message) {
    expect(message.json.companyId).toBe('114')
    expect(message.json.id).toBe('1AgP2VGe5MvX2eBnxxx')
  }
}
@Injectable()
class RegexListener {
  @OnMessage('events-*')
  onMessage(message: Message) {
    expect(message.attributes.type).toBe('regex-type')
  }
}
@Module({
  imports: [DiscoveryModule],
  providers: [SimpleListener, NeverCalledListener, RegexListener]
})
class TestModule { }

@suite('[Decorator] On message decorator')
export class PubsubHandlerTest extends BaseTest {
  private discoveryService: DiscoveryService

  async before() {
    const moduleRef = await Test.createTestingModule({
      imports: [TestModule]
    }).compile()

    this.discoveryService = moduleRef.get<DiscoveryService>(DiscoveryService)
  }

  @test('Given message with subscription then invoke SimpleListener')
  async messageWithListener() {
    await PubsubHandler.handle(this.message(), this.context('events'), this.discoveryService)
  }

  @test('Given message without subscription then do not invoke any listener')
  async messageWithoutListener() {
    await PubsubHandler.handle(this.message(), this.context('no-listeners'), this.discoveryService)
    expect(true).toBeTruthy()
  }

  @test('Given message without subscription using regex then do not invoke any RegexListener')
  async messageWithRegexListener() {
    await PubsubHandler.handle(this.message('regex-type'), this.context('events-skore-2020'), this.discoveryService)
  }
}
