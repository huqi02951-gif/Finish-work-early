import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

type CustomerContextPayload = {
  name?: string;
  contactPerson?: string;
  phone?: string;
  industry?: string;
  channel?: string;
  remark?: string;
  extraData?: unknown;
};

@Injectable()
export class CustomerContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async listMine(userId: number, search?: string) {
    return this.prisma.customerContext.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { customerName: { contains: search, mode: 'insensitive' } },
                { contactPerson: { contains: search, mode: 'insensitive' } },
                { industry: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ lastUsedAt: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async create(userId: number, input: CustomerContextPayload) {
    const customerName = String(input.name || '').trim();
    if (!customerName) {
      throw new BadRequestException('name is required');
    }

    const context = await this.prisma.customerContext.create({
      data: {
        userId,
        customerName,
        contactPerson: this.normalizeOptionalText(input.contactPerson),
        phone: this.normalizeOptionalText(input.phone),
        industry: this.normalizeOptionalText(input.industry),
        channel: this.normalizeOptionalText(input.channel),
        remark: this.normalizeOptionalText(input.remark),
        extraData: input.extraData as Prisma.InputJsonValue | undefined,
        lastUsedAt: new Date(),
      },
    });

    await this.auditLogService.record({
      module: 'customer-context',
      action: 'create',
      operatorId: userId,
      targetType: 'customer_context',
      targetId: String(context.id),
      detail: {
        name: context.customerName,
      },
    });

    return context;
  }

  async update(userId: number, id: number, input: CustomerContextPayload) {
    const existing = await this.prisma.customerContext.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer context not found');
    }

    const updated = await this.prisma.customerContext.update({
      where: { id },
      data: {
        customerName: input.name ? String(input.name).trim() : undefined,
        contactPerson: input.contactPerson === undefined ? undefined : this.normalizeOptionalText(input.contactPerson),
        phone: input.phone === undefined ? undefined : this.normalizeOptionalText(input.phone),
        industry: input.industry === undefined ? undefined : this.normalizeOptionalText(input.industry),
        channel: input.channel === undefined ? undefined : this.normalizeOptionalText(input.channel),
        remark: input.remark === undefined ? undefined : this.normalizeOptionalText(input.remark),
        extraData:
          input.extraData === undefined ? undefined : (input.extraData as Prisma.InputJsonValue),
        lastUsedAt: new Date(),
      },
    });

    await this.auditLogService.record({
      module: 'customer-context',
      action: 'update',
      operatorId: userId,
      targetType: 'customer_context',
      targetId: String(updated.id),
    });

    return updated;
  }

  async remove(userId: number, id: number) {
    const existing = await this.prisma.customerContext.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Customer context not found');
    }

    const deleted = await this.prisma.customerContext.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.auditLogService.record({
      module: 'customer-context',
      action: 'delete',
      operatorId: userId,
      targetType: 'customer_context',
      targetId: String(deleted.id),
    });

    return { success: true };
  }

  private normalizeOptionalText(value?: string | null) {
    const normalized = String(value || '').trim();
    return normalized || null;
  }
}
