import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import * as path from 'path';
import { IAuthUser } from 'src/DTO/user.dto';
import { AudioUpload } from 'src/interfaces/audio.interface';
import { Audio } from 'src/schemas/audio.schema';

@Injectable()
export class AudioService {
  constructor(
    @InjectModel('Audio') private readonly audioModel: Model<Audio>,
    @InjectModel('Users') private readonly userModel: Model<IAuthUser>,
  ) {}

  async getListTracks() {
    const audio = await this.audioModel.find().exec();

    const listAudio = audio.map((track) => {
      return {
        title: track.title,
        artist: track.artist,
        url: track.url,
      };
    });

    return listAudio;
  }

  async uploadAudio(body: AudioUpload, user: IAuthUser) {
    const existUser = await this.userModel.findOne({ _id: user.sub }).exec();
    console.log('🚀 ~ AudioService ~ uploadAudio ~ existUser:', existUser);

    if (!existUser) {
      throw new BadRequestException('User not found');
    }

    const fileExtention = body.file.originalname.split('.').pop();
    const fileName = body.artist + body.title + '.' + fileExtention;
    const filePath = path.join(process.cwd(), 'audio', fileName);
    fs.writeFileSync(filePath, body.file.buffer);

    const newAudio = await this.audioModel.create({
      title: body.title,
      artist: body.artist,
      album: body.album || '',
      genre: body.genre || '',
      year: body.year || '',
      url: `audio/get_audio?name=${fileName}`,
      userId: existUser._id,
    });

    return newAudio;
  }
}
