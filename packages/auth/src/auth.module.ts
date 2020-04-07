import { HttpModule, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { BearerGuard } from './guard'

@Module({
  imports: [HttpModule, PassportModule],
  providers: [BearerGuard],
  exports: [BearerGuard],
})
export class AuthModule {}
