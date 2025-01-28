import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AudioSchema } from 'src/schemas/audio.schema';
import { UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Audio', schema: AudioSchema },
      { name: 'Users', schema: UserSchema },
    ]),
  ],
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
