import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { PageConfigsModule } from './page-configs/page-configs.module';
import { CatalogProductsModule } from './catalog-products/catalog-products.module';
import { CatalogSkillsModule } from './catalog-skills/catalog-skills.module';
import { ForumModule } from './forum/forum.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RolesModule } from './roles/roles.module';
import { CustomerContextModule } from './customer-context/customer-context.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { ToolDataModule } from './tool-data/tool-data.module';
import { PantryModule } from './pantry/pantry.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    RolesModule,
    PageConfigsModule,
    CatalogProductsModule,
    CatalogSkillsModule,
    ForumModule,
    CustomerContextModule,
    ToolDataModule,
    AuditLogModule,
    PantryModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
