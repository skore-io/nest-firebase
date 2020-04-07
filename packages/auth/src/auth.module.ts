import { HttpModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { OAuth2Client } from 'google-auth-library'
import { ClientGuard, UserGuard } from './guard'

@Module({
  imports: [HttpModule, PassportModule, ConfigModule.forRoot()],
  providers: [
    ClientGuard,
    UserGuard,
    { provide: OAuth2Client, useFactory: () => new OAuth2Client() },
  ],
  exports: [ClientGuard, UserGuard],
})
export class AuthModule {}
