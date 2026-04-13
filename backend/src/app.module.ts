import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { AppController } from './app.controller';
import { PageConfigsModule } from './page-configs/page-configs.module';
import { CatalogProductsModule } from './catalog-products/catalog-products.module';
import { CatalogSkillsModule } from './catalog-skills/catalog-skills.module';
import { ForumModule } from './forum/forum.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    PageConfigsModule,
    CatalogProductsModule,
    CatalogSkillsModule,
    ForumModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
