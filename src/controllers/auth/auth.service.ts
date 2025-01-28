import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import * as bcript from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDTO, UserRegisterDTO } from 'src/DTO/user.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Users') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerService(user: UserRegisterDTO) {
    try {
      const userAlredyExists = await this.userModel.findOne({
        email: user.email,
      });

      if (userAlredyExists) {
        return new BadRequestException('User already exists');
      }

      const salt = await bcript.genSalt(10);
      const hashedPassword = await bcript.hash(user.password, salt);

      const newUser = await this.userModel
        .findOneAndUpdate(
          { email: user.email },
          {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            password: hashedPassword,
          },
          { upsert: true, new: true },
        )
        .exec();

      if (newUser) {
        const payload = {
          email: newUser.email,
          sub: newUser._id,
        };
        return {
          ascessToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
          refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
      } else {
        return new BadRequestException('User not created');
      }
    } catch (error) {
      return error;
    }
  }

  async loginService(user: UserLoginDTO) {
    try {
      const userExists = await this.userModel.findOne({
        email: user.email,
      });

      if (!userExists) {
        return new BadRequestException('User not found');
      }

      const isMatch = await bcript.compare(user.password, userExists.password);

      if (isMatch) {
        const payload = {
          email: userExists.email,
          sub: userExists._id,
        };
        return {
          accessToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
          refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
      } else {
        return new BadRequestException('Invalid credentials');
      }
    } catch (error) {
      return error;
    }
  }

  async refreshTokensService(refresh_token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userModel.findOne({ email: payload.email });

      if (!user) {
        throw new UnauthorizedException({ message: 'User not found' });
      }

      const newPayload = { email: user.email, sub: user._id };

      return {
        accessToken: await this.jwtService.signAsync(newPayload, {
          expiresIn: '1d',
        }),
        refreshToken: await this.jwtService.signAsync(newPayload, {
          expiresIn: '7d',
        }),
      };
    } catch {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
  }
}
