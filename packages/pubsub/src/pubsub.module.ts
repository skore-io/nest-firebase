import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';
import { PubsubHandler } from './handler';

@Module({
  exports: [PubsubHandler],
  imports: [DiscoveryModule],
  providers: [PubsubHandler]
})
export class PubsubModule {}
