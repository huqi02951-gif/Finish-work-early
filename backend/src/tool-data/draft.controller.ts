import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DraftService } from './draft.service';

@Controller('drafts')
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async listMine(@Req() req, @Query('toolId') toolId?: string) {
    return this.draftService.listMine(req.user.sub, toolId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.draftService.getOne(req.user.sub, id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async upsert(
    @Req() req,
    @Body()
    body: {
      toolId?: string;
      title?: string;
      data?: Record<string, unknown> | unknown[];
    },
  ) {
    return this.draftService.upsert(req.user.sub, body);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.draftService.remove(req.user.sub, id);
  }
}
