import { Body, Controller, Post, Query, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDTO, UserRegisterDTO } from 'src/DTO/user.dto';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { User } from 'src/schemas/user.schema';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { SetMessage } from 'src/decorators/message.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() user: UserRegisterDTO) {
    try {
      return this.authService.registerService(user);
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  @Post('login')
  async login(@Body() user: UserLoginDTO) {
    return this.authService.loginService(user);
  }

  @Post('refresh_token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { refresh_token: { type: 'string' } },
    },
  })
  async refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshTokensService(body.refresh_token);
  }
}
