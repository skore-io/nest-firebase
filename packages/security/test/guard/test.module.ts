import { Controller, Get, HttpModule, Module, Request } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'
import {
  ClientGuard,
  CurrentUser,
  IsClient,
  IsUser,
  UserGuard,
} from '../../src'

@Controller()
export class AuthedController {
  @Get('client')
  @IsClient()
  client(@Request() req: any) {
    return req.user
  }

  @Get('user')
  @IsUser()
  user(@CurrentUser() user: any) {
    return user
  }
}

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: 'test/.env' }), HttpModule],
  controllers: [AuthedController],
  providers: [
    ClientGuard,
    UserGuard,
    { provide: OAuth2Client, useFactory: () => new OAuth2Client() },
  ],
})
export class TestModule {}
