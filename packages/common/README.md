## @nest-firebase/common

## Description
This module provides `UserMiddleware` class to authenticate user

## Motivation
At @skore-io our endpoints requires an `Authorization` header with jwt token and given this
token we fetch user from given url

To facilitate this steps, we developed this library.

## Usage

### Install

`npm install @nest-firebase/common`

### Configure .env file

In your `.env` file add the following line:

```
USER_AUTH_URL="https://..."
```

### Authenticating routes

Setup `UserMiddleware` for all `/users` routes:

```typescript
@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [UserController]
})
class TestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('users')
  }
}
```

### Receiving user in request object

In your controller you receive user in `Req` object.

If request was made successfully:

```typescript
@Controller('users')
class UserController {
  @Get()
  neverCalled(@Req() req:any) {
    console.log(req.user)
  }
}
```

### Responses

This are possible status code for this middleware:

- No authorization token provided in request: `401`
- No `USER_AUTH_URL` configured in module: `500`
- Error calling user provider api: `401`
