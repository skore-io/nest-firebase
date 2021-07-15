import { Expose, Transform, Type } from 'class-transformer'
import { Team } from './team.domain'

export class User {
  @Transform(({ value }) => String(value))
  @Expose()
  id!: string

  @Transform(({ value }) => String(value))
  @Expose({ name: 'company_id' })
  companyId!: string

  @Expose()
  role!: string

  @Expose()
  name!: string

  @Expose()
  username: string

  @Expose()
  email: string

  @Expose()
  avatar: string

  @Expose()
  metadata: any

  @Expose()
  preferences: any

  @Type(() => Team)
  @Transform(({ value }) => value || [])
  @Expose()
  teams: Team[] = []

  @Expose({ name: 'created_at' })
  createdAt!: Date
}
