import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
@UseGuards(AuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getLogs(
    @Req() req,
    @Query('module') module?: string,
    @Query('operatorId') operatorId?: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogService.listLogs({
      module,
      operatorId: operatorId ? Number(operatorId) : undefined,
      targetType,
      targetId,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
