import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ArtifactPayload = {
  toolId?: string;
  title?: string;
  content?: string;
  metadata?: unknown;
};

@Injectable()
export class ArtifactService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: number, toolId?: string, limit?: number) {
    const normalizedLimit = limit === undefined ? undefined : Math.min(Math.max(limit, 1), 100);

    return this.prisma.artifact.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(toolId ? { toolId: toolId.trim() } : {}),
      },
      orderBy: { createdAt: 'desc' },
      ...(normalizedLimit ? { take: normalizedLimit } : {}),
    });
  }

  async create(userId: number, input: ArtifactPayload) {
    const toolId = this.requireText(input.toolId, 'toolId', 100);
    const title = this.requireText(input.title, 'title', 200);
    const content = this.requireContent(input.content);
    const metadata = input.metadata === undefined ? undefined : (input.metadata as Prisma.InputJsonValue);

    return this.prisma.artifact.create({
      data: {
        userId,
        toolId,
        title,
        content,
        metadata,
      },
    });
  }

  async remove(userId: number, id: number) {
    const artifact = await this.prisma.artifact.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!artifact) {
      throw new NotFoundException('Artifact not found');
    }

    await this.prisma.artifact.update({
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

  private requireContent(value: string | undefined) {
    const normalized = String(value || '').trim();
    if (!normalized) {
      throw new BadRequestException('content is required');
    }
    return normalized;
  }
}
