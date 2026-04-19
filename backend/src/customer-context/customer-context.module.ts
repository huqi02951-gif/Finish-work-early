import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CustomerContextController } from './customer-context.controller';
import { CustomerContextService } from './customer-context.service';

@Module({
  imports: [AuditLogModule],
  controllers: [CustomerContextController],
  providers: [CustomerContextService],
  exports: [CustomerContextService],
})
export class CustomerContextModule {}
