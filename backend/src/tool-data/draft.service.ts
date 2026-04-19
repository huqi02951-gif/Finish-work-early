import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type DraftPayload = {
  toolId?: string;
  title?: string;
  data?: unknown;
};

@Injectable()
export class DraftService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: number, toolId?: string) {
    return this.prisma.draft.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(toolId ? { toolId: toolId.trim() } : {}),
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getOne(userId: number, id: number) {
    const draft = await this.prisma.draft.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!draft) {
      throw new NotFoundException('Draft not found');
    }

    return draft;
  }

  async upsert(userId: number, input: DraftPayload) {
    const toolId = this.requireText(input.toolId, 'toolId', 100);
    const title = this.requireText(input.title, 'title', 200);
    const data = this.requireJsonValue(input.data, 'data');

    const existing = await this.prisma.draft.findFirst({
      where: {
        userId,
        toolId,
        title,
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      return this.prisma.draft.update({
        where: { id: existing.id },
        data: {
          data,
          deletedAt: null,
        },
      });
    }

    return this.prisma.draft.create({
      data: {
        userId,
        toolId,
        title,
        data,
      },
    });
  }

  async remove(userId: number, id: number) {
    await this.getOne(userId, id);

    await this.prisma.draft.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  private requireText(value: string | undefined, field: string, maxLength: number) {
    const normalized = String(value || '').trim();
    if (!normalized) {
      throw new BadRequestException(`${field} is required`);
    }
    if (normalized.length > maxLength) {
      throw new BadRequestException(`${field} is too long`);
    }
    return normalized;
  }

  private requireJsonValue(value: unknown, field: string): Prisma.InputJsonValue {
    if (value === undefined || value === null) {
      throw new BadRequestException(`${field} is required`);
    }
    return value as Prisma.InputJsonValue;
  }
}
