import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface SkillPayload {
  slug?: string;
  title?: string;
  category?: string;
  summary?: string;
  toolRoute?: string | null;
  formLabel?: string | null;
  status?: CatalogStatus;
  sortOrder?: number;
  detailData?: Prisma.InputJsonValue;
}

@Injectable()
export class CatalogSkillsService {
  constructor(private readonly prisma: PrismaService) {}

  private validatePayload(input: SkillPayload, partial = false) {
    if (!partial || input.slug !== undefined) {
      if (typeof input.slug !== 'string' || !input.slug.trim()) {
        throw new BadRequestException('slug is required');
      }
    }
    if (!partial || input.title !== undefined) {
      if (typeof input.title !== 'string' || !input.title.trim()) {
        throw new BadRequestException('title is required');
      }
    }
    if (!partial || input.category !== undefined) {
      if (typeof input.category !== 'string' || !input.category.trim()) {
        throw new BadRequestException('category is required');
      }
    }
    if (!partial || input.summary !== undefined) {
      if (typeof input.summary !== 'string' || !input.summary.trim()) {
        throw new BadRequestException('summary is required');
      }
    }
    if (!partial || input.detailData !== undefined) {
      if (input.detailData === undefined || input.detailData === null || typeof input.detailData !== 'object') {
        throw new BadRequestException('detailData must be an object');
      }
    }
    if (input.status !== undefined && !Object.values(CatalogStatus).includes(input.status)) {
      throw new BadRequestException('invalid status');
    }
    if (input.sortOrder !== undefined && !Number.isFinite(input.sortOrder)) {
      throw new BadRequestException('sortOrder must be a number');
    }
  }

  async listPublicSkills(category?: string, search?: string) {
    return this.prisma.skill.findMany({
      where: {
        status: CatalogStatus.PUBLISHED,
        deletedAt: null,
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { slug: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
      include: {
        products: {
          orderBy: { sortOrder: 'asc' },
          include: { product: true },
        },
      },
    });
  }

  async getPublicSkill(slug: string) {
    const skill = await this.prisma.skill.findFirst({
      where: {
        slug,
        status: CatalogStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        products: {
          orderBy: { sortOrder: 'asc' },
          include: { product: true },
        },
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async listAdminSkills(search?: string) {
    return this.prisma.skill.findMany({
      where: search
        ? {
            OR: [
              { slug: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
      include: {
        products: {
          orderBy: { sortOrder: 'asc' },
          include: { product: true },
        },
      },
    });
  }

  async createSkill(input: SkillPayload) {
    this.validatePayload(input);
    return this.prisma.skill.create({
      data: {
        slug: input.slug!.trim(),
        title: input.title!.trim(),
        category: input.category!.trim(),
        summary: input.summary!.trim(),
        toolRoute: input.toolRoute || null,
        formLabel: input.formLabel || null,
        status: input.status || CatalogStatus.DRAFT,
        sortOrder: input.sortOrder ?? 0,
        detailData: input.detailData!,
      },
    });
  }

  async updateSkill(id: number, input: SkillPayload) {
    this.validatePayload(input, true);
    const existing = await this.prisma.skill.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Skill not found');
    }

    return this.prisma.skill.update({
      where: { id },
      data: {
        slug: input.slug?.trim(),
        title: input.title?.trim(),
        category: input.category?.trim(),
        summary: input.summary?.trim(),
        toolRoute: input.toolRoute === undefined ? undefined : input.toolRoute,
        formLabel: input.formLabel === undefined ? undefined : input.formLabel,
        status: input.status,
        sortOrder: input.sortOrder,
        detailData: input.detailData,
        deletedAt: null,
      },
    });
  }
}
