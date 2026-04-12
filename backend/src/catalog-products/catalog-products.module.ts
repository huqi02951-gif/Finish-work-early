import { Module } from '@nestjs/common';
import { CatalogProductsService } from './catalog-products.service';
import { PublicProductsController } from './public-products.controller';
import { AdminProductsController } from './admin-products.controller';
import { RolesGuard } from '../common/roles.guard';

@Module({
  controllers: [PublicProductsController, AdminProductsController],
  providers: [CatalogProductsService, RolesGuard],
})
export class CatalogProductsModule {}
