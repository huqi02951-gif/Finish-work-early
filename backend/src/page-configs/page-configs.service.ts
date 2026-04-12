import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const SUPPORTED_PAGE_KEYS = ['home_page', 'skills_library_page'] as const;
type SupportedPageKey = (typeof SUPPORTED_PAGE_KEYS)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${field} must be a non-empty string`);
  }
}

function assertStringArray(value: unknown, field: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new BadRequestException(`${field} must be an array of non-empty strings`);
  }
}

function validateHomePageConfig(configData: unknown) {
  if (!isRecord(configData)) {
    throw new BadRequestException('configData must be an object');
  }

  if (!isRecord(configData.hero)) {
    throw new BadRequestException('hero must be an object');
  }
  assertString(configData.hero.title, 'hero.title');
  assertString(configData.hero.subtitle, 'hero.subtitle');

  if (!Array.isArray(configData.scenarios)) {
    throw new BadRequestException('scenarios must be an array');
  }
  configData.scenarios.forEach((scenario, index) => {
    if (!isRecord(scenario)) {
      throw new BadRequestException(`scenarios[${index}] must be an object`);
    }
    assertString(scenario.id, `scenarios[${index}].id`);
    assertString(scenario.title, `scenarios[${index}].title`);
    assertString(scenario.desc, `scenarios[${index}].desc`);
    assertString(scenario.path, `scenarios[${index}].path`);
  });

  if (!isRecord(configData.footer)) {
    throw new BadRequestException('footer must be an object');
  }
  assertString(configData.footer.badgeText, 'footer.badgeText');
  assertString(configData.footer.creditText, 'footer.creditText');
}

function validateSkillsLibraryPageConfig(configData: unknown) {
  if (!isRecord(configData)) {
    throw new BadRequestException('configData must be an object');
  }

  assertString(configData.badgeText, 'badgeText');
  assertString(configData.title, 'title');
  assertString(configData.subtitle, 'subtitle');
  assertStringArray(configData.filterOptions, 'filterOptions');

  if (!isRecord(configData.emptyState)) {
    throw new BadRequestException('emptyState must be an object');
  }
  assertString(configData.emptyState.title, 'emptyState.title');
  assertString(configData.emptyState.description, 'emptyState.description');
  assertString(configData.emptyState.resetLabel, 'emptyState.resetLabel');
}

@Injectable()
export class PageConfigsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertPageKey(pageKey: string): SupportedPageKey {
    if (!SUPPORTED_PAGE_KEYS.includes(pageKey as SupportedPageKey)) {
      throw new BadRequestException(`Unsupported pageKey: ${pageKey}`);
    }
    return pageKey as SupportedPageKey;
  }

  private validateConfig(pageKey: SupportedPageKey, configData: unknown) {
    if (pageKey === 'home_page') {
      validateHomePageConfig(configData);
      return;
    }
    validateSkillsLibraryPageConfig(configData);
  }

  async getPublicConfig(pageKey: string) {
    const safePageKey = this.assertPageKey(pageKey);
    const config = await this.prisma.pageConfig.findFirst({
      where: {
        pageKey: safePageKey,
        deletedAt: null,
      },
    });

    if (!config) {
      throw new NotFoundException('Page config not found');
    }

    return config;
  }

  async getAdminConfig(pageKey: string) {
    const safePageKey = this.assertPageKey(pageKey);
    const config = await this.prisma.pageConfig.findFirst({
      where: {
        pageKey: safePageKey,
        deletedAt: null,
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            username: true,
            nickname: true,
          },
        },
      },
    });

    if (!config) {
      throw new NotFoundException('Page config not found');
    }

    return config;
  }

  async upsertConfig(pageKey: string, configData: unknown, updatedById: number, schemaVersion?: number) {
    const safePageKey = this.assertPageKey(pageKey);
    this.validateConfig(safePageKey, configData);
    const safeConfigData = configData as Prisma.InputJsonValue;

    const existing = await this.prisma.pageConfig.findUnique({
      where: { pageKey: safePageKey },
    });

    if (!existing) {
      return this.prisma.pageConfig.create({
        data: {
          pageKey: safePageKey,
          configData: safeConfigData,
          schemaVersion: schemaVersion && schemaVersion > 0 ? schemaVersion : 1,
          version: 1,
          updatedById,
          publishedAt: new Date(),
        },
      });
    }

    return this.prisma.pageConfig.update({
      where: { pageKey: safePageKey },
      data: {
        configData: safeConfigData,
        schemaVersion: schemaVersion && schemaVersion > 0 ? schemaVersion : existing.schemaVersion,
        version: existing.version + 1,
        updatedById,
        publishedAt: new Date(),
        deletedAt: null,
      },
    });
  }
}
