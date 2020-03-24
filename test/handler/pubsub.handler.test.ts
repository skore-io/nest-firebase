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
    expect(message.json.company_id).toBe('114')
    expect(message.json.batch_id).toBe('1AgP2VGe5MvX2eBnxxx')
  }
}
@Module({
  imports: [DiscoveryModule],
  providers: [SimpleListener, NeverCalledListener]
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
}
