import { Module } from '@nestjs/common';
import { CatalogSkillsService } from './catalog-skills.service';
import { PublicSkillsController } from './public-skills.controller';
import { AdminSkillsController } from './admin-skills.controller';
import { RolesGuard } from '../common/roles.guard';

@Module({
  controllers: [PublicSkillsController, AdminSkillsController],
  providers: [CatalogSkillsService, RolesGuard],
})
export class CatalogSkillsModule {}
