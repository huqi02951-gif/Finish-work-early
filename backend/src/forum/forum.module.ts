import { Module } from '@nestjs/common';
import { PublicForumController } from './public-forum.controller';
import { UserForumController } from './user-forum.controller';
import { AdminForumController } from './admin-forum.controller';
import { ForumService } from './forum.service';

@Module({
  controllers: [PublicForumController, UserForumController, AdminForumController],
  providers: [ForumService],
  exports: [ForumService],
})
export class ForumModule {}
