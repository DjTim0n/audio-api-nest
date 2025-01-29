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
import { Verify } from 'src/schemas/verify.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Users') private readonly userModel: Model<User>,
    @InjectModel('Verify') private readonly verifyModel: Model<Verify>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
  ) {}

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  async registerService(user: UserRegisterDTO) {
    const userAlredyExists = await this.userModel.findOne({
      email: user.email,
    });

    if (userAlredyExists) {
      throw new BadRequestException('User already exists');
    }
    const code: number = this.generateOTP();

    const sended = await this.mailService.sendMail({
      to: user.email,
      subject: 'Welcome to Audio-TimSpace!',
      text: `Welcome to Audio-TimSpace! Your verify code: ${code}`,
    });

    if (!sended) {
      throw new BadRequestException('Email not sended');
    }

    const salt = await bcript.genSalt(10);
    const hashedPassword = await bcript.hash(user.password, salt);

    await this.userModel
      .findOneAndUpdate(
        { email: user.email },
        {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          password: hashedPassword,
          verified: false,
        },
        { upsert: true, new: true },
      )
      .exec();

    const verify = new this.verifyModel({ email: user.email, code: code });
    verify.save();
    return true;
  }

  async verifyEmailService(email: string, code: number) {
    const verifyUser = await this.verifyModel.findOne({ email });
    const user = await this.userModel.findOne({ email });
    if (!verifyUser || !user) {
      throw new BadRequestException({ message: 'User not found' });
    }
    if (verifyUser.code !== code) {
      throw new BadRequestException({ message: 'Invalid code' });
    }
    if (user.verified === true) {
      throw new BadRequestException({ message: 'User already verified' });
    }
    await this.verifyModel.deleteOne({ email });
    user.verified = true;
    await user.save();
    const payload = {
      email: user.email,
      sub: user._id,
    };
    return {
      ascessToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async resendVerificationCodeService(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException({ message: 'User not found' });
    }

    if (user.verified === true) {
      throw new BadRequestException({ message: 'User already verified' });
    }

    const code: number = this.generateOTP();

    const sended = await this.mailService.sendMail({
      to: user.email,
      subject: 'Welcome to Audio-TimSpace!',
      text: `Welcome to Audio-TimSpace! Your verify code: ${code}`,
    });

    if (!sended) {
      throw new BadRequestException('Email not sended');
    }

    await this.verifyModel.findOneAndUpdate(
      { email: email },
      { email: email, code: code },
      { upsert: true, new: true },
    );
    return true;
  }

  async loginService(user: UserLoginDTO) {
    const userExists = await this.userModel.findOne({
      email: user.email,
    });

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await bcript.compare(user.password, userExists.password);

    if (!userExists.verified && isMatch) {
      this.resendVerificationCodeService(user.email);
      throw new BadRequestException('User not verified');
    }

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
      throw new BadRequestException('Invalid credentials');
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
