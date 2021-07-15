import { Expose, Transform } from 'class-transformer'

export class Team {
  @Transform(({ value }) => String(value))
  @Expose()
  id: string

  @Expose()
  name: string
}
