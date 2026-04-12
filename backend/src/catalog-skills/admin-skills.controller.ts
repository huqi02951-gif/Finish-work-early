import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CatalogSkillsService } from './catalog-skills.service';

@Controller('admin/skills')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSkillsController {
  constructor(private readonly catalogSkillsService: CatalogSkillsService) {}

  @Get()
  async getSkills(@Query('search') search?: string) {
    return this.catalogSkillsService.listAdminSkills(search);
  }

  @Post()
  async createSkill(@Body() body: any) {
    return this.catalogSkillsService.createSkill(body);
  }

  @Put(':id')
  async updateSkill(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.catalogSkillsService.updateSkill(id, body);
  }
}
