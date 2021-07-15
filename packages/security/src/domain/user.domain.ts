import { Expose, Transform } from 'class-transformer'

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

  @Expose({ name: 'created_at' })
  createdAt!: Date
}
