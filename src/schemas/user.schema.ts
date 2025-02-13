import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ type: String })
  first_name?: string;

  @Prop({ type: String })
  last_name?: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ type: Boolean, default: false })
  verified: boolean;

  @Prop({ type: String })
  avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
