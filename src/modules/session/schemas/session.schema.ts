import { HydratedDocument, SchemaTypes, Types } from 'mongoose'
import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { ExpiryDuration } from 'src/shared/enums'
import { BaseSchema } from 'src/shared/schemas'
import { User } from '../../user/schemas'

export type SessionDocument = HydratedDocument<Session>

export class Session extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  userId: string

  @Prop()
  accessToken: string

  @Prop()
  refreshToken: string

  @Prop()
  ipAddress: string

  @Prop({ type: Map, of: SchemaTypes.Mixed })
  device: Record<string, unknown>

  @Prop({
    default: Date.now(),
    index: true,
    expires: ExpiryDuration.TWENTY_FOUR_HOURS,
  })
  createdAt: Date
}

export const SessionSchema = SchemaFactory.createForClass(Session)
