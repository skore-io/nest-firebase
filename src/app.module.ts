import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';

@Module({
  imports: [DiscoveryModule]
})
export class NestFirebaseModule {}
