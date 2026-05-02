import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PantryAdminController, PantryController } from './pantry.controller';
import { PantryGateway } from './pantry.gateway';
import { PantryService } from './pantry.service';

@Module({
  imports: [PrismaModule],
  controllers: [PantryController, PantryAdminController],
  providers: [PantryService, PantryGateway],
  exports: [PantryService],
})
export class PantryModule {}
