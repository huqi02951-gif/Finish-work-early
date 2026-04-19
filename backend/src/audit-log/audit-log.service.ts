import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type RecordAuditLogInput = {
  module: string;
  action: string;
  operatorId?: number | null;
  targetType?: string | null;
  targetId?: string | null;
  detail?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async listLogs(params: {
    module?: string;
    operatorId?: number;
    targetType?: string;
    targetId?: string;
    limit?: number;
  }) {
    const limit = Number(params.limit || 50);

    return this.prisma.auditLog.findMany({
      where: {
        ...(params.module ? { module: params.module } : {}),
        ...(params.operatorId ? { operatorId: params.operatorId } : {}),
        ...(params.targetType ? { targetType: params.targetType } : {}),
        ...(params.targetId ? { targetId: params.targetId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 200),
      include: {
        operator: {
          select: {
            id: true,
            username: true,
            nickname: true,
            role: true,
          },
        },
      },
    });
  }

  async record(input: RecordAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        module: input.module,
        action: input.action,
        operatorId: input.operatorId ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        detail: input.detail,
      },
    });
  }
}
