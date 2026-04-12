import { Controller, Get, Post, Body, Req, UseGuards, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createPost(@Req() req, @Body() body: { title: string; content: string; category?: string }) {
    return this.postsService.create(req.user.sub, body.title, body.content, body.category);
  }

  @Get()
  async getPosts(@Query('category') category?: string) {
    return this.postsService.findAll(category);
  }

  @Get(':id')
  async getPostDetail(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findById(id);
  }
}
