import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Audio {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  artist: string;

  @Prop({ type: String })
  album: string;

  @Prop({ type: String })
  genre: string;

  @Prop({ type: String })
  year: string;

  @Prop({ type: String })
  url: string;

  @Prop({ type: String })
  userId: string;
}

export const AudioSchema = SchemaFactory.createForClass(Audio);
