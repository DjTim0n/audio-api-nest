import { Module } from '@nestjs/common';
import { AudioModule } from './controllers/audio/audio.module';
import { AuthModule } from './controllers/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ProfileModule } from './controllers/profile/profile.module';

@Module({
  imports: [
    AudioModule,
    AuthModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/AudioDB',
      }),
      inject: [ConfigService],
    }),
    ProfileModule,
  ],
})
export class AppModule {}
