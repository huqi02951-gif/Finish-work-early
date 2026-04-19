import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModerationAction, PostStatus, PostType, PostSourceType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ListPostsParams = {
  boardSlug?: string;
  category?: string;
  postType?: string;
  status?: string;
  isOfficial?: string;
  tag?: string;
  q?: string;
  legacy?: boolean | string;
  page?: number;
  pageSize?: number;
};

type CreatePostInput = {
  boardSlug?: string;
  category?: string;
  title?: string;
  summary?: string;
  content?: string;
  tags?: string[];
  postType?: string;
  relatedProductSlug?: string;
  relatedSkillSlug?: string;
  relatedPageKey?: string;
  contentData?: Prisma.InputJsonValue | null;
};

type UpdatePostInput = Partial<CreatePostInput> & {
  isOfficial?: boolean;
  status?: string;
};

const authorSelect = {
  id: true,
  username: true,
  nickname: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const postListInclude = {
  board: {
    select: {
      id: true,
      slug: true,
      name: true,
      isOfficial: true,
    },
  },
  author: {
    select: authorSelect,
  },
  tags: {
    include: {
      tag: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
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
} satisfies Prisma.PostInclude;

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoards() {
    const boards = await this.prisma.board.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
      },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: {
            posts: {
              where: {
                deletedAt: null,
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    });

    return boards.map((board) => ({
      id: board.id,
      slug: board.slug,
      name: board.name,
      description: board.description,
      isOfficial: board.isOfficial,
      requiresReview: board.requiresReview,
      sortOrder: board.sortOrder,
      postCount: board._count.posts,
    }));
  }

  async listPublicPosts(params: ListPostsParams) {
    return this.listPosts({
      ...params,
      includeHidden: false,
    });
  }

  async getPublicPostDetail(id: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        deletedAt: null,
        status: 'PUBLISHED',
      },
      include: postListInclude,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.serializePostDetail(post);
  }

  async getPublicComments(postId: number, page = 1, pageSize = 20) {
    await this.ensurePostExists(postId, false);

    const normalizedPage = this.normalizePage(page);
    const normalizedPageSize = this.normalizePageSize(pageSize);
    const where: Prisma.CommentWhereInput = {
      postId,
      deletedAt: null,
      status: 'PUBLISHED',
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (normalizedPage - 1) * normalizedPageSize,
        take: normalizedPageSize,
        include: {
          author: {
            select: authorSelect,
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      items: items.map((comment) => this.serializeComment(comment)),
      page: normalizedPage,
      pageSize: normalizedPageSize,
      total,
    };
  }

  async createPost(userId: number, input: CreatePostInput) {
    const board = await this.resolveBoardForCreate(input);
    const title = this.requireText(input.title, 'title');
    const content = this.requireText(input.content, 'content');
    const summary = this.normalizeOptionalText(input.summary);
    const postType = this.parsePostType(input.postType, PostType.DISCUSSION);
    const category = board?.name ?? this.requireText(input.category, 'category');
    const status = board?.requiresReview ? PostStatus.PENDING : PostStatus.PUBLISHED;

    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          boardId: board?.id,
          title,
          summary,
          content,
          contentData: input.contentData ?? undefined,
          category,
          postType,
          sourceType: PostSourceType.USER,
          isOfficial: false,
          status,
          authorId: userId,
          relatedProductSlug: this.normalizeOptionalText(input.relatedProductSlug),
          relatedSkillSlug: this.normalizeOptionalText(input.relatedSkillSlug),
          relatedPageKey: this.normalizeOptionalText(input.relatedPageKey),
        },
        include: postListInclude,
      });

      await this.syncTags(tx, created.id, this.normalizeTags(input.tags));
      return tx.post.findUniqueOrThrow({
        where: { id: created.id },
        include: postListInclude,
      });
    });

    return this.serializePostDetail(post);
  }

  async updateOwnPost(userId: number, postId: number, input: UpdatePostInput) {
    const existing = await this.prisma.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
        deletedAt: null,
      },
      include: {
        board: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    if (existing.isOfficial) {
      throw new ForbiddenException('Official posts cannot be edited by author');
    }

    const board = input.boardSlug ? await this.requireBoard(input.boardSlug) : existing.board;
    const data: Prisma.PostUpdateInput = {
      title: input.title ? this.requireText(input.title, 'title') : undefined,
      summary: input.summary !== undefined ? this.normalizeOptionalText(input.summary) : undefined,
      content: input.content ? this.requireText(input.content, 'content') : undefined,
      category: board?.name,
      board: board ? { connect: { id: board.id } } : undefined,
      relatedProductSlug:
        input.relatedProductSlug !== undefined ? this.normalizeOptionalText(input.relatedProductSlug) : undefined,
      relatedSkillSlug:
        input.relatedSkillSlug !== undefined ? this.normalizeOptionalText(input.relatedSkillSlug) : undefined,
      relatedPageKey:
        input.relatedPageKey !== undefined ? this.normalizeOptionalText(input.relatedPageKey) : undefined,
    };

    const post = await this.prisma.$transaction(async (tx) => {
      await tx.post.update({
        where: { id: postId },
        data,
      });

      if (input.tags !== undefined) {
        await this.syncTags(tx, postId, this.normalizeTags(input.tags));
      }

      return tx.post.findUniqueOrThrow({
        where: { id: postId },
        include: postListInclude,
      });
    });

    return this.serializePostDetail(post);
  }

  async deleteOwnPost(userId: number, postId: number) {
    const existing = await this.prisma.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    if (existing.isOfficial) {
      throw new ForbiddenException('Official posts cannot be deleted by author');
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.ARCHIVED,
        deletedAt: new Date(),
      },
      include: postListInclude,
    });

    return this.serializePostDetail(updated);
  }

  async listMyPosts(userId: number, page = 1, pageSize = 20) {
    const normalizedPage = this.normalizePage(page);
    const normalizedPageSize = this.normalizePageSize(pageSize);
    const where: Prisma.PostWhereInput = {
      authorId: userId,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { pinnedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (normalizedPage - 1) * normalizedPageSize,
        take: normalizedPageSize,
        include: postListInclude,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: items.map((item) => this.serializePostSummary(item)),
      page: normalizedPage,
      pageSize: normalizedPageSize,
      total,
    };
  }

  async createComment(userId: number, postId: number, content: string) {
    await this.ensureCommentablePost(postId);

    const normalizedContent = this.requireText(content, 'content');
    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: normalizedContent,
      },
      include: {
        author: {
          select: authorSelect,
        },
      },
    });

    return this.serializeComment(comment);
  }

  async listAdminPosts(params: ListPostsParams & { status?: string }) {
    return this.listPosts({
      ...params,
      includeHidden: true,
    });
  }

  async reviewPost(operatorId: number, postId: number, action: string, reason?: string) {
    const existing = await this.prisma.post.findUnique({
      where: { id: postId },
      include: postListInclude,
    });

    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    const normalizedAction = String(action || '').trim().toLowerCase();
    const now = new Date();
    let data: Prisma.PostUpdateInput;
    let logAction: ModerationAction;

    if (normalizedAction === 'approve') {
      data = {
        status: PostStatus.PUBLISHED,
        deletedAt: null,
        reviewedAt: now,
        reviewedBy: { connect: { id: operatorId } },
        reviewReason: this.normalizeOptionalText(reason),
      };
      logAction = ModerationAction.APPROVE;
    } else if (normalizedAction === 'reject') {
      data = {
        status: PostStatus.REJECTED,
        reviewedAt: now,
        reviewedBy: { connect: { id: operatorId } },
        reviewReason: this.normalizeOptionalText(reason),
      };
      logAction = ModerationAction.REJECT;
    } else if (normalizedAction === 'hide') {
      data = {
        status: PostStatus.HIDDEN,
        reviewedAt: now,
        reviewedBy: { connect: { id: operatorId } },
        reviewReason: this.normalizeOptionalText(reason),
      };
      logAction = ModerationAction.HIDE;
    } else if (normalizedAction === 'restore') {
      data = {
        status: PostStatus.PUBLISHED,
        deletedAt: null,
        reviewedAt: now,
        reviewedBy: { connect: { id: operatorId } },
        reviewReason: this.normalizeOptionalText(reason),
      };
      logAction = ModerationAction.RESTORE;
    } else if (normalizedAction === 'delete') {
      data = {
        status: PostStatus.ARCHIVED,
        deletedAt: now,
        reviewedAt: now,
        reviewedBy: { connect: { id: operatorId } },
        reviewReason: this.normalizeOptionalText(reason),
      };
      logAction = ModerationAction.DELETE;
    } else {
      throw new BadRequestException('Unsupported review action');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const post = await tx.post.update({
        where: { id: postId },
        data,
        include: postListInclude,
      });

      await tx.moderationLog.create({
        data: {
          postId,
          operatorId,
          action: logAction,
          reason: this.normalizeOptionalText(reason),
        },
      });

      return post;
    });

    return this.serializePostDetail(updated);
  }

  async setPinned(operatorId: number, postId: number, pinned: boolean) {
    const existing = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          isPinned: pinned,
          pinnedAt: pinned ? new Date() : null,
        },
        include: postListInclude,
      });

      await tx.moderationLog.create({
        data: {
          postId,
          operatorId,
          action: pinned ? ModerationAction.PIN : ModerationAction.UNPIN,
        },
      });

      return post;
    });

    return this.serializePostDetail(updated);
  }

  async setCommentsLocked(operatorId: number, postId: number, locked: boolean) {
    const existing = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          commentsLockedAt: locked ? new Date() : null,
        },
        include: postListInclude,
      });

      await tx.moderationLog.create({
        data: {
          postId,
          operatorId,
          action: locked ? ModerationAction.LOCK_COMMENTS : ModerationAction.UNLOCK_COMMENTS,
        },
      });

      return post;
    });

    return this.serializePostDetail(updated);
  }

  async createAdminPost(operatorId: number, input: UpdatePostInput) {
    const board = await this.requireBoard(input.boardSlug);
    const title = this.requireText(input.title, 'title');
    const content = this.requireText(input.content, 'content');
    const summary = this.normalizeOptionalText(input.summary);
    const postType = this.parsePostType(input.postType, PostType.GUIDE);
    const isOfficial = input.isOfficial ?? true;

    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          boardId: board.id,
          title,
          summary,
          content,
          contentData: input.contentData ?? undefined,
          category: board.name,
          postType,
          sourceType: PostSourceType.ADMIN,
          isOfficial,
          status: this.parsePostStatus(input.status, PostStatus.PUBLISHED),
          authorId: operatorId,
          relatedProductSlug: this.normalizeOptionalText(input.relatedProductSlug),
          relatedSkillSlug: this.normalizeOptionalText(input.relatedSkillSlug),
          relatedPageKey: this.normalizeOptionalText(input.relatedPageKey),
        },
        include: postListInclude,
      });

      await this.syncTags(tx, created.id, this.normalizeTags(input.tags));
      return tx.post.findUniqueOrThrow({
        where: { id: created.id },
        include: postListInclude,
      });
    });

    return this.serializePostDetail(post);
  }

  async updateAdminPost(operatorId: number, postId: number, input: UpdatePostInput) {
    const existing = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        board: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    const board = input.boardSlug ? await this.requireBoard(input.boardSlug) : existing.board;
    const data: Prisma.PostUpdateInput = {
      title: input.title ? this.requireText(input.title, 'title') : undefined,
      summary: input.summary !== undefined ? this.normalizeOptionalText(input.summary) : undefined,
      content: input.content ? this.requireText(input.content, 'content') : undefined,
      contentData: input.contentData !== undefined ? input.contentData : undefined,
      board: board ? { connect: { id: board.id } } : undefined,
      category: board?.name,
      isOfficial: input.isOfficial,
      postType: input.postType ? this.parsePostType(input.postType, existing.postType) : undefined,
      status: input.status ? this.parsePostStatus(input.status, existing.status) : undefined,
      relatedProductSlug:
        input.relatedProductSlug !== undefined ? this.normalizeOptionalText(input.relatedProductSlug) : undefined,
      relatedSkillSlug:
        input.relatedSkillSlug !== undefined ? this.normalizeOptionalText(input.relatedSkillSlug) : undefined,
      relatedPageKey:
        input.relatedPageKey !== undefined ? this.normalizeOptionalText(input.relatedPageKey) : undefined,
      reviewedAt: new Date(),
      reviewedBy: { connect: { id: operatorId } },
    };

    const post = await this.prisma.$transaction(async (tx) => {
      await tx.post.update({
        where: { id: postId },
        data,
      });

      if (input.tags !== undefined) {
        await this.syncTags(tx, postId, this.normalizeTags(input.tags));
      }

      return tx.post.findUniqueOrThrow({
        where: { id: postId },
        include: postListInclude,
      });
    });

    return this.serializePostDetail(post);
  }

  async hideComment(operatorId: number, commentId: number, hidden: boolean, reason?: string) {
    const existing = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: authorSelect,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.update({
        where: { id: commentId },
        data: {
          status: hidden ? 'HIDDEN' : 'PUBLISHED',
        },
        include: {
          author: {
            select: authorSelect,
          },
        },
      });

      await tx.moderationLog.create({
        data: {
          commentId,
          postId: existing.postId,
          operatorId,
          action: hidden ? ModerationAction.HIDE : ModerationAction.RESTORE,
          reason: this.normalizeOptionalText(reason),
        },
      });

      return comment;
    });

    return this.serializeComment(updated);
  }

  private async listPosts(
    params: ListPostsParams & { includeHidden: boolean },
  ) {
    const page = this.normalizePage(params.page);
    const pageSize = this.normalizePageSize(params.pageSize);
    const where = this.buildPostWhere(params, params.includeHidden);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { pinnedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: postListInclude,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: items.map((item) => this.serializePostSummary(item)),
      page,
      pageSize,
      total,
    };
  }

  private buildPostWhere(
    params: ListPostsParams & { includeHidden: boolean },
    includeHidden: boolean,
  ): Prisma.PostWhereInput {
    const includeLegacy = String(params.legacy) === 'true';
    const where: Prisma.PostWhereInput = {
      ...(includeHidden
        ? {}
        : {
            deletedAt: null,
            status: 'PUBLISHED',
          }),
      ...(!includeLegacy && !params.category && !params.boardSlug ? { boardId: { not: null } } : {}),
      ...(params.boardSlug ? { board: { slug: params.boardSlug } } : {}),
      ...(params.category
        ? {
            category: {
              equals: params.category,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(params.postType ? { postType: this.parsePostType(params.postType, PostType.DISCUSSION) } : {}),
      ...(params.status ? { status: this.parsePostStatus(params.status, PostStatus.PUBLISHED) } : {}),
      ...(params.isOfficial !== undefined
        ? { isOfficial: String(params.isOfficial) === 'true' }
        : {}),
      ...(params.tag
        ? {
            tags: {
              some: {
                tag: {
                  OR: [{ slug: params.tag }, { name: params.tag }],
                },
              },
            },
          }
        : {}),
    };

    if (params.q) {
      const query = String(params.q).trim();
      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ];
      }
    }

    return where;
  }

  private async resolveBoardForCreate(input: CreatePostInput) {
    if (input.boardSlug) {
      return this.requireBoard(input.boardSlug);
    }

    const mappedBoardSlug = this.mapLegacyCategoryToBoardSlug(input.category);
    if (!mappedBoardSlug) {
      return null;
    }

    return this.requireBoard(mappedBoardSlug);
  }

  private mapLegacyCategoryToBoardSlug(category?: string | null) {
    const normalizedCategory = this.normalizeOptionalText(category);
    if (!normalizedCategory) return null;

    const legacyCategoryBoardMap: Record<string, string> = {
      '经验分享': 'experience-sharing',
      '系统操作': 'system-operations',
      '合规探讨': 'compliance-discussion',
      '产品实战': 'product-practice',
      'Skills 交流': 'skills-discussion',
      'Skills交流': 'skills-discussion',
    };

    return legacyCategoryBoardMap[normalizedCategory] || null;
  }

  private async requireBoard(boardSlug?: string) {
    const normalizedSlug = this.normalizeOptionalText(boardSlug);
    if (!normalizedSlug) {
      throw new BadRequestException('boardSlug is required');
    }

    const board = await this.prisma.board.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
        status: 'ACTIVE',
      },
    });

    if (!board) {
      throw new BadRequestException('Board not found');
    }

    return board;
  }

  private async ensurePostExists(postId: number, includeHidden: boolean) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        ...(includeHidden ? {} : { deletedAt: null, status: 'PUBLISHED' }),
      },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }

  private async ensureCommentablePost(postId: number) {
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

    if (post.commentsLockedAt) {
      throw new BadRequestException('Comments are locked');
    }
  }

  private async syncTags(tx: Prisma.TransactionClient, postId: number, tags: string[]) {
    await tx.postTag.deleteMany({
      where: { postId },
    });

    if (tags.length === 0) {
      return;
    }

    const tagIds: number[] = [];
    for (const [index, name] of tags.entries()) {
      const tag = await tx.tag.upsert({
        where: { name },
        update: {
          slug: this.slugifyTag(name),
          status: 'ACTIVE',
          sortOrder: tags.length - index,
        },
        create: {
          name,
          slug: this.slugifyTag(name),
          status: 'ACTIVE',
          sortOrder: tags.length - index,
        },
        select: { id: true },
      });
      tagIds.push(tag.id);
    }

    await tx.postTag.createMany({
      data: tagIds.map((tagId) => ({
        postId,
        tagId,
      })),
      skipDuplicates: true,
    });
  }

  private serializePostSummary(post: any) {
    return {
      id: post.id,
      title: post.title,
      summary: post.summary,
      content: post.content,
      board: post.board
        ? {
            id: post.board.id,
            slug: post.board.slug,
            name: post.board.name,
            isOfficial: post.board.isOfficial,
          }
        : null,
      postType: post.postType,
      isOfficial: post.isOfficial,
      isPinned: post.isPinned,
      status: post.status,
      category: post.category,
      relatedProductSlug: post.relatedProductSlug,
      relatedSkillSlug: post.relatedSkillSlug,
      relatedPageKey: post.relatedPageKey,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author
        ? {
            id: post.author.id,
            username: post.author.username,
            nickname: post.author.nickname,
            role: post.author.role,
            createdAt: post.author.createdAt,
          }
        : null,
      tags: (post.tags || []).map((item) => ({
        id: item.tag.id,
        slug: item.tag.slug,
        name: item.tag.name,
      })),
      commentCount: post._count?.comments || 0,
      commentsLocked: Boolean(post.commentsLockedAt),
    };
  }

  private serializePostDetail(post: any) {
    return {
      ...this.serializePostSummary(post),
      contentData: post.contentData,
      externalKey: post.externalKey,
      sourceType: post.sourceType,
      pinnedAt: post.pinnedAt,
      reviewedAt: post.reviewedAt,
      reviewReason: post.reviewReason,
      deletedAt: post.deletedAt,
    };
  }

  private serializeComment(comment: any) {
    return {
      id: comment.id,
      postId: comment.postId,
      content: comment.content,
      status: comment.status,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author
        ? {
            id: comment.author.id,
            username: comment.author.username,
            nickname: comment.author.nickname,
            role: comment.author.role,
            createdAt: comment.author.createdAt,
          }
        : null,
    };
  }

  private normalizePage(page?: number) {
    const value = Number(page || 1);
    if (!Number.isFinite(value) || value < 1) return 1;
    return Math.floor(value);
  }

  private normalizePageSize(pageSize?: number) {
    const value = Number(pageSize || 20);
    if (!Number.isFinite(value) || value < 1) return 20;
    return Math.min(Math.floor(value), 50);
  }

  private requireText(value: string | undefined, field: string) {
    const normalized = String(value || '').trim();
    if (!normalized) {
      throw new BadRequestException(`${field} is required`);
    }
    return normalized;
  }

  private normalizeOptionalText(value?: string | null) {
    const normalized = String(value || '').trim();
    return normalized ? normalized : null;
  }

  private normalizeTags(tags?: string[]) {
    return Array.from(new Set((tags || []).map((item) => String(item || '').trim()).filter(Boolean)));
  }

  private parsePostType(value: string | undefined, fallback: PostType) {
    if (!value) return fallback;
    const normalized = String(value).trim().toUpperCase();
    if (normalized in PostType) {
      return PostType[normalized as keyof typeof PostType];
    }
    throw new BadRequestException('Invalid postType');
  }

  private parsePostStatus(value: string | undefined, fallback: PostStatus) {
    if (!value) return fallback;
    const normalized = String(value).trim().toUpperCase();
    if (normalized in PostStatus) {
      return PostStatus[normalized as keyof typeof PostStatus];
    }
    throw new BadRequestException('Invalid status');
  }

  private slugifyTag(input: string) {
    return input.trim().toLowerCase().replace(/\s+/g, '-');
  }
}
