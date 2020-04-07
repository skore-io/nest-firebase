import { HttpModule, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { UserGuard } from './guard'

@Module({
  imports: [HttpModule, PassportModule],
  providers: [UserGuard],
  exports: [UserGuard],
})
export class AuthModule {}
