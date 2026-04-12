import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogSkillsService } from './catalog-skills.service';

@Controller('public/skills')
export class PublicSkillsController {
  constructor(private readonly catalogSkillsService: CatalogSkillsService) {}

  @Get()
  async getSkills(@Query('category') category?: string, @Query('search') search?: string) {
    return this.catalogSkillsService.listPublicSkills(category, search);
  }

  @Get(':slug')
  async getSkill(@Param('slug') slug: string) {
    return this.catalogSkillsService.getPublicSkill(slug);
  }
}
