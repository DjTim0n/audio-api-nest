import { Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthUser } from 'src/decorators/user.decorator';
import { IAuthUser } from 'src/DTO/user.dto';
import { Auth } from 'src/guard/auth.guard';
import { ApiBody } from '@nestjs/swagger';

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

  @Patch('update_profile')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        avatar: { type: 'string' },
      },
    },
    required: true,
  })
  async updateProfile(
    @AuthUser() user: IAuthUser,
    @Body() body: { first_name: string; last_name: string; avatar: string },
  ) {
    try {
      return this.profileService.updateProfileService(user, body);
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
