import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: number, title: string, content: string, category?: string) {
    const normalizedTitle = title?.trim();
    const normalizedContent = content?.trim();

    if (!normalizedTitle || !normalizedContent) {
      throw new BadRequestException('title and content are required');
    }

    return this.prisma.post.create({
      data: {
        title: normalizedTitle,
        content: normalizedContent,
        category: category?.trim() || '经验分享',
        authorId,
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
        _count: {
          select: {
            comments: {
              where: {
                deletedAt: null,
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    });
  }

  async findAll(category?: string) {
    return this.prisma.post.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            nickname: true,
            role: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            comments: {
              where: {
                deletedAt: null,
                status: 'PUBLISHED',
              },
            },
          },
        }
      }
    });
  }

  async findById(id: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        deletedAt: null,
        status: 'PUBLISHED',
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
        comments: {
          where: {
            deletedAt: null,
            status: 'PUBLISHED',
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
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
