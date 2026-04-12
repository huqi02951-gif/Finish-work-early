import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogProductsService } from './catalog-products.service';

@Controller('public/products')
export class PublicProductsController {
  constructor(private readonly catalogProductsService: CatalogProductsService) {}

  @Get()
  async getProducts(@Query('search') search?: string) {
    return this.catalogProductsService.listPublicProducts(search);
  }

  @Get(':slug')
  async getProduct(@Param('slug') slug: string) {
    return this.catalogProductsService.getPublicProduct(slug);
  }
}
