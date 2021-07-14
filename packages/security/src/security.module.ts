import { HttpModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'
import { User } from './domain'
import { AdminGuard, ClientGuard, UserGuard } from './guard'
import { RestTemplate } from './template'

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  providers: [
    AdminGuard,
    ClientGuard,
    RestTemplate,
    UserGuard,
    User,
    { provide: OAuth2Client, useFactory: () => new OAuth2Client() },
  ],
  exports: [AdminGuard, ClientGuard, UserGuard, OAuth2Client, RestTemplate, User],
})
export class SecurityModule {}
