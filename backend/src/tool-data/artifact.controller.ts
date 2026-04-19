import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ArtifactService } from './artifact.service';

@Controller('artifacts')
export class ArtifactController {
  constructor(private readonly artifactService: ArtifactService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async listMine(
    @Req() req,
    @Query('toolId') toolId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.artifactService.listMine(
      req.user.sub,
      toolId,
      limit ? Number(limit) : undefined,
    );
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req,
    @Body()
    body: {
      toolId?: string;
      title?: string;
      content?: string;
      metadata?: Record<string, unknown> | unknown[];
    },
  ) {
    return this.artifactService.create(req.user.sub, body);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.artifactService.remove(req.user.sub, id);
  }
}
