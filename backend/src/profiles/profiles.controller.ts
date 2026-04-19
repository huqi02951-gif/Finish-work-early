import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getMyProfile(@Req() req) {
    return this.profilesService.getMyProfile(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateMyProfile(
    @Req() req,
    @Body() body: { nickname?: string; avatarUrl?: string | null; bio?: string | null; phone?: string | null },
  ) {
    return this.profilesService.updateMyProfile(req.user.sub, body);
  }
}
