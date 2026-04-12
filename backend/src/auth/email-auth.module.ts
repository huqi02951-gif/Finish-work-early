import { Module } from '@nestjs/common';
import { EmailAuthService } from './email-auth.service';
import { EmailAuthController } from './email-auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'FINISH_WORK_PHASE_1_SECRET',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [EmailAuthController],
  providers: [EmailAuthService],
  exports: [EmailAuthService],
})
export class EmailAuthModule {}
