import { HttpModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'
import { ClientGuard, GraphqlGuard, UserGuard } from './guard'
import { RestTemplate } from './template'

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  providers: [
    ClientGuard,
    GraphqlGuard,
    RestTemplate,
    UserGuard,
    { provide: OAuth2Client, useFactory: () => new OAuth2Client() },
  ],
  exports: [ClientGuard, UserGuard, OAuth2Client],
})
export class SecurityModule {}
