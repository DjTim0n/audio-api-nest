import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthUser } from 'src/decorators/user.decorator';
import { IAuthUser } from 'src/DTO/user.dto';
import { Auth } from 'src/guard/auth.guard';

@Auth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('get_profile')
  async getProfile(@AuthUser() user: IAuthUser) {
    try {
      return this.profileService.getProfileService(user);
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  @Get('get_user_info')
  async getUserInfo(@AuthUser() user: IAuthUser) {
    try {
      return this.profileService.getUserInfoService(user.sub);
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
