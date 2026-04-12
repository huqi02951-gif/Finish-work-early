import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: number, postId: number, content: string) {
    const normalizedContent = content?.trim();
    if (!normalizedContent) {
      throw new BadRequestException('content is required');
    }

    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
        status: 'PUBLISHED',
      },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.comment.create({
      data: {
        content: normalizedContent,
        authorId,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            nickname: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
