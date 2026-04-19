import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { ForumService } from '../forum/forum.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly forumService: ForumService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('me/posts')
  async getMyPosts(@Req() req) {
    // Compatibility route. Canonical endpoint is GET /forum/me/posts.
    const result = await this.forumService.listMyPosts(req.user.sub);
    return result.items;
  }
}
