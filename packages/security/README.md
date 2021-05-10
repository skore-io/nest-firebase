## @nest-firebase/security

## Description

This module provides protection to actions/queries through decorators.

## Installation

```bash
$ npm install --save @nest-firebase/security
```

## Methods

| Name           | Description                                                     | .env           |
| -------------- | --------------------------------------------------------------- | -------------- |
| @isUser()      | Check if token belongs to a valid user                          | USER_AUTH_URL  |
| @isAdmin()     | Check if token belongs to a valid admin user                    | USER_AUTH_URL  |
| @isClient()    | Use google-auth-library to verify the integrity of the ID token | OAUTH_AUDIENCE |
| @CurrentUser() | Get a payload with token owner data.                            |                |

## Usage

Just annotate yout REST actions and Graphql queries/mutations methods with decorator.

The client should send a Bearer authorization header e.g., `'Authorization: Bearer JWT_TOKEN'`.

You can also use the `@CurrentUser` param annotation to get access to the current user.

1. Add `USER_AUTH_URL` or `OAUTH_AUDIENCE` to **.env**

```env
USER_AUTH_URL='https://knowledge-staging.skore.io/workspace/v1/users/current'
OAUTH_AUDIENCE='https://test.skore.io'
```

2. Import the decorator and have fun

```typescript
import { IsUser, CurrentUser } from '@nest-firebase/security'

@Controller('users')
export class UserController {
  @IsUser()
  @Get()
  async hello(@CurrentUser() user: any): string {
    return user.companyId
  }
}
```
