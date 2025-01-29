import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Verify {
  @Prop({ required: true, type: String })
  email: string;
  @Prop({ required: true, type: Number })
  code: number;
}

export const VerifySchema = SchemaFactory.createForClass(Verify);
