import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ForumService } from './forum.service';

@Controller('forum')
export class PublicForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('boards')
  async getBoards() {
    return this.forumService.getBoards();
  }

  @Get('posts')
  async getPosts(
    @Query('boardSlug') boardSlug?: string,
    @Query('category') category?: string,
    @Query('postType') postType?: string,
    @Query('isOfficial') isOfficial?: string,
    @Query('tag') tag?: string,
    @Query('q') q?: string,
    @Query('legacy') legacy?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.forumService.listPublicPosts({
      boardSlug,
      category,
      postType,
      isOfficial,
      tag,
      q,
      legacy,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('posts/:id')
  async getPostDetail(@Param('id', ParseIntPipe) id: number) {
    return this.forumService.getPublicPostDetail(id);
  }

  @Get('posts/:id/comments')
  async getComments(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.forumService.getPublicComments(
      id,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
    );
  }
}
