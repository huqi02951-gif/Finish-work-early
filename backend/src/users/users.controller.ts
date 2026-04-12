import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { PostsService } from '../posts/posts.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('me/posts')
  async getMyPosts(@Req() req) {
    return this.postsService.findByAuthorId(req.user.sub);
  }
}
