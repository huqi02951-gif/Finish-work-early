import { Controller, Get, Param } from '@nestjs/common';
import { PageConfigsService } from './page-configs.service';

@Controller('public/configs')
export class PublicConfigsController {
  constructor(private readonly pageConfigsService: PageConfigsService) {}

  @Get(':pageKey')
  async getConfig(@Param('pageKey') pageKey: string) {
    return this.pageConfigsService.getPublicConfig(pageKey);
  }
}
