import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAuthUser } from 'src/DTO/user.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(@InjectModel('Users') private readonly userModel: Model<User>) {}

  async getProfileService(user: IAuthUser) {
    try {
      const profile = await this.userModel.findOne({ _id: user.sub }).exec();
      return {
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserInfoService(userId: string) {
    try {
      const profile = await this.userModel.findOne({ _id: userId }).exec();
      return {
        first_name: profile.first_name,
        last_name: profile.last_name,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
