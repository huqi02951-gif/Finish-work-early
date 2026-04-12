import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CatalogProductsService } from './catalog-products.service';

@Controller('admin/products')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductsController {
  constructor(private readonly catalogProductsService: CatalogProductsService) {}

  @Get()
  async getProducts(@Query('search') search?: string) {
    return this.catalogProductsService.listAdminProducts(search);
  }

  @Post()
  async createProduct(@Body() body: any) {
    return this.catalogProductsService.createProduct(body);
  }

  @Put(':id')
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.catalogProductsService.updateProduct(id, body);
  }

  @Put(':id/skills')
  async replaceProductSkills(@Param('id', ParseIntPipe) id: number, @Body() body: { skillIds: number[] }) {
    return this.catalogProductsService.replaceProductSkills(id, body?.skillIds);
  }
}
