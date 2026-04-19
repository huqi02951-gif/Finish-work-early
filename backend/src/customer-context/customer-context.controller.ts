import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CustomerContextService } from './customer-context.service';

@Controller('customer-context')
export class CustomerContextController {
  constructor(private readonly customerContextService: CustomerContextService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getMyContexts(@Req() req, @Query('search') search?: string) {
    return this.customerContextService.listMine(req.user.sub, search);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createContext(
    @Req() req,
    @Body()
    body: {
      name?: string;
      contactPerson?: string;
      phone?: string;
      industry?: string;
      channel?: string;
      remark?: string;
      extraData?: Record<string, unknown>;
    },
  ) {
    return this.customerContextService.create(req.user.sub, body);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateContext(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      contactPerson?: string;
      phone?: string;
      industry?: string;
      channel?: string;
      remark?: string;
      extraData?: Record<string, unknown>;
    },
  ) {
    return this.customerContextService.update(req.user.sub, id, body);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteContext(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.customerContextService.remove(req.user.sub, id);
  }
}
