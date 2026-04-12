import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface ProductPayload {
  slug?: string;
  name?: string;
  category?: string;
  summary?: string;
  coverUrl?: string | null;
  targetUrl?: string | null;
  status?: CatalogStatus;
  sortOrder?: number;
  detailData?: Prisma.InputJsonValue;
}

@Injectable()
export class CatalogProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private validatePayload(input: ProductPayload, partial = false) {
    if (!partial || input.slug !== undefined) {
      if (typeof input.slug !== 'string' || !input.slug.trim()) {
        throw new BadRequestException('slug is required');
      }
    }
    if (!partial || input.name !== undefined) {
      if (typeof input.name !== 'string' || !input.name.trim()) {
        throw new BadRequestException('name is required');
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

  async listPublicProducts(search?: string) {
    return this.prisma.product.findMany({
      where: {
        status: CatalogStatus.PUBLISHED,
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
      include: {
        skills: {
          orderBy: { sortOrder: 'asc' },
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async getPublicProduct(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: CatalogStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        skills: {
          orderBy: { sortOrder: 'asc' },
          include: {
            skill: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async listAdminProducts(search?: string) {
    return this.prisma.product.findMany({
      where: search
        ? {
            OR: [
              { slug: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
      include: {
        skills: {
          orderBy: { sortOrder: 'asc' },
          include: { skill: true },
        },
      },
    });
  }

  async createProduct(input: ProductPayload) {
    this.validatePayload(input);
    return this.prisma.product.create({
      data: {
        slug: input.slug!.trim(),
        name: input.name!.trim(),
        category: input.category!.trim(),
        summary: input.summary!.trim(),
        coverUrl: input.coverUrl || null,
        targetUrl: input.targetUrl || null,
        status: input.status || CatalogStatus.DRAFT,
        sortOrder: input.sortOrder ?? 0,
        detailData: input.detailData!,
      },
    });
  }

  async updateProduct(id: number, input: ProductPayload) {
    this.validatePayload(input, true);
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        slug: input.slug?.trim(),
        name: input.name?.trim(),
        category: input.category?.trim(),
        summary: input.summary?.trim(),
        coverUrl: input.coverUrl === undefined ? undefined : input.coverUrl,
        targetUrl: input.targetUrl === undefined ? undefined : input.targetUrl,
        status: input.status,
        sortOrder: input.sortOrder,
        detailData: input.detailData,
        deletedAt: null,
      },
    });
  }

  async replaceProductSkills(productId: number, skillIds: number[]) {
    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      throw new BadRequestException('skillIds must be a non-empty array');
    }

    const uniqueSkillIds = [...new Set(skillIds)];
    if (uniqueSkillIds.some((value) => !Number.isInteger(value))) {
      throw new BadRequestException('skillIds must contain integers');
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const skills = await this.prisma.skill.findMany({
      where: {
        id: { in: uniqueSkillIds },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (skills.length !== uniqueSkillIds.length) {
      throw new BadRequestException('One or more skills do not exist');
    }

    await this.prisma.$transaction([
      this.prisma.productSkillRel.deleteMany({ where: { productId } }),
      this.prisma.productSkillRel.createMany({
        data: uniqueSkillIds.map((skillId, index) => ({
          productId,
          skillId,
          sortOrder: index,
        })),
      }),
    ]);

    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        skills: {
          orderBy: { sortOrder: 'asc' },
          include: { skill: true },
        },
      },
    });
  }
}
