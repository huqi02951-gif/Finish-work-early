import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ForumService } from './forum.service';

@Controller('forum')
export class UserForumController {
  constructor(private readonly forumService: ForumService) {}

  @UseGuards(AuthGuard)
  @Post('posts')
  async createPost(@Req() req, @Body() body: any) {
    return this.forumService.createPost(req.user.sub, body);
  }

  @UseGuards(AuthGuard)
  @Patch('posts/:id')
  async updatePost(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.forumService.updateOwnPost(req.user.sub, id, body);
  }

  @UseGuards(AuthGuard)
  @Delete('posts/:id')
  async deletePost(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.forumService.deleteOwnPost(req.user.sub, id);
  }

  @UseGuards(AuthGuard)
  @Post('posts/:id/comments')
  async createComment(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: { content?: string }) {
    return this.forumService.createComment(req.user.sub, id, body.content || '');
  }

  @UseGuards(AuthGuard)
  @Get('me/posts')
  async getMyPosts(@Req() req, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.forumService.listMyPosts(
      req.user.sub,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
    );
  }
}
