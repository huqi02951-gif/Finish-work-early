import { Module } from '@nestjs/common';
import { PublicConfigsController } from './public-configs.controller';
import { AdminConfigsController } from './admin-configs.controller';
import { PageConfigsService } from './page-configs.service';
import { RolesGuard } from '../common/roles.guard';

@Module({
  controllers: [PublicConfigsController, AdminConfigsController],
  providers: [PageConfigsService, RolesGuard],
})
export class PageConfigsModule {}
