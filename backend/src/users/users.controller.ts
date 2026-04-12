import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    // req.user comes from AuthGuard extracting JWT payload { sub, username }
    return this.usersService.findById(req.user.sub);
  }
}
