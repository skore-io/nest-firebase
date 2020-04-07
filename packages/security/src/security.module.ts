import { HttpModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { OAuth2Client } from 'google-auth-library'
import { ClientGuard, UserGuard } from './guard'
import { RestTemplate } from './template'

@Module({
  imports: [HttpModule, PassportModule, ConfigModule.forRoot()],
  providers: [
    ClientGuard,
    RestTemplate,
    UserGuard,
    { provide: OAuth2Client, useFactory: () => new OAuth2Client() },
  ],
  exports: [ClientGuard, UserGuard],
})
export class SecurityModule {}
