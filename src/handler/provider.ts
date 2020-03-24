export class Provider {
  constructor(
    private readonly className: string,
    private readonly topicName: string,
    private readonly type: string,
    private readonly actions: string
  ) { }
}
