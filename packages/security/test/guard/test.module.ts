import { Controller, Get, HttpModule, Module, Request } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import {
  Field,
  GraphQLModule,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql'
import { OAuth2Client } from 'google-auth-library'
import {
  ClientGuard,
  CurrentUser,
  IsClient,
  IsUser,
  IsAdmin,
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

  @Get('admin')
  @IsAdmin()
  admin(@CurrentUser() admin: any) {
    return admin
  }
}

@ObjectType()
class User {
  constructor(id: string) {
    this.id = id
  }

  @Field()
  id: string
}

@Resolver()
export class UserResolver {
  @Query(() => User)
  @IsUser()
  user(@CurrentUser({ graphql: true }) user: any) {
    return new User(user.id)
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'test/.env' }),
    HttpModule,
    GraphQLModule.forRoot({
      context: ({ req }) => ({ req }),
      autoSchemaFile: true,
    }),
  ],
  controllers: [AuthedController],
  providers: [
    ClientGuard,
    UserResolver,
    UserGuard,
    { provide: OAuth2Client, useFactory: () => new OAuth2Client() },
  ],
})
export class TestModule {}
