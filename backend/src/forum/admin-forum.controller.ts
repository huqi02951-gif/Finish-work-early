import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ForumService } from './forum.service';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMIN)
@Controller('forum/admin')
export class AdminForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('posts')
  async getPosts(
    @Query('boardSlug') boardSlug?: string,
    @Query('postType') postType?: string,
    @Query('isOfficial') isOfficial?: string,
    @Query('tag') tag?: string,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.forumService.listAdminPosts({
      boardSlug,
      postType,
      isOfficial,
      tag,
      q,
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Patch('posts/:id/review')
  async reviewPost(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { action?: string; reason?: string },
  ) {
    return this.forumService.reviewPost(req.user.sub, id, body.action || '', body.reason);
  }

  @Patch('posts/:id/pin')
  async pinPost(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: { pinned?: boolean }) {
    return this.forumService.setPinned(req.user.sub, id, Boolean(body.pinned));
  }

  @Patch('posts/:id/lock-comments')
  async lockComments(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: { locked?: boolean }) {
    return this.forumService.setCommentsLocked(req.user.sub, id, Boolean(body.locked));
  }

  @Post('posts')
  async createPost(@Req() req, @Body() body: any) {
    return this.forumService.createAdminPost(req.user.sub, body);
  }

  @Patch('posts/:id')
  async updatePost(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.forumService.updateAdminPost(req.user.sub, id, body);
  }

  @Patch('comments/:id/hide')
  async hideComment(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { hidden?: boolean; reason?: string },
  ) {
    return this.forumService.hideComment(req.user.sub, id, body.hidden ?? true, body.reason);
  }
}
