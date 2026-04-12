import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PageConfigsService } from './page-configs.service';

@Controller('admin/configs')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminConfigsController {
  constructor(private readonly pageConfigsService: PageConfigsService) {}

  @Get(':pageKey')
  async getConfig(@Param('pageKey') pageKey: string) {
    return this.pageConfigsService.getAdminConfig(pageKey);
  }

  @Put(':pageKey')
  async updateConfig(@Param('pageKey') pageKey: string, @Req() req, @Body() body: any) {
    return this.pageConfigsService.upsertConfig(
      pageKey,
      body?.configData ?? body,
      req.user.sub,
      body?.schemaVersion,
    );
  }
}
