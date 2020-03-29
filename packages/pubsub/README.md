## @nest-firebase/pubsub

## Description
This module provides `@OnMessage()` decorator to handle messages based on attributes

## Motivation
At @skore-io we're building an event-driven architecture using firebase functions, which means
that we're heavily using pubsub to emmit and receive events.

Unfortunately we can't filter messages before it arrives at service, so we've to do this work
on each message that invokes a function. The steps we do always is: create nest instance,
check `message.attributes.type` or `message.attributes.action`.

To facilitate this steps, we developed this library.

## Usage

### Install

`npm install @nest-firebase/pubsub`

### Import

Import and add `NestFirebaseModule` to the `imports` section of the module you wish to implement.

```typescript
import { PubsubModule } from '@nest-firebase/pubsub';
import { Module } from '@nestjs/common';

@Module({
  imports: [PubsubModule]
})
export class AppModule { }
```

### Filtering messages

The `PubsubModule` exposes `@OnMessage()` decorator to filter your messages

To filter messages from topic `events` with type `io.skore.events.user` and action `created`:

```typescript
import { Injectable } from '@nestjs/common'
import { OnMessage } from '@nest-firebase/pubsub';
import { Message } from 'firebase-functions/lib/providers/pubsub'

@Injectable()
export class UserCreatedListener {
  @OnMessage({
    topic: 'events',
    type: 'io.skore.events.user',
    action: 'created'
  })
  async onUserCreatedMessage(message: Message): void {}
}
```

`type` and `action` accept regular expressions, let's suppose you want to listen for 
all `type` which contains `io.skore` and `action` which is `created` or `updated`, so do the following:

```typescript
import { Injectable } from '@nestjs/common'
import { OnMessage } from '@nest-firebase/pubsub';
import { Message } from 'firebase-functions/lib/providers/pubsub'

@Injectable()
export class UserCreatedListener {
  @OnMessage({
    topic: 'events',
    type: 'io.skore.*',
    action: 'created|updated'
  })
  async onUserCreatedMessage(message: Message): void {}
}
```

### Exporting firebase function

To use firebase functions you must export your functions in an `index.ts` file, so do the following:

```typescript
import { Pubsub } from '@nest-firebase/pubsub';

export const onEvent = Pubsub.topic('events', AppModule)
```

Where `events` is your pubsub topic and `AppModule` is your nest module which imports `PubsubModule`
