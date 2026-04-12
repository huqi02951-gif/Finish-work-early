import { Controller, Post, Body, Req, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createComment(
    @Req() req, 
    @Param('postId', ParseIntPipe) postId: number, 
    @Body() body: { content: string }
  ) {
    return this.commentsService.create(req.user.sub, postId, body.content);
  }
}
