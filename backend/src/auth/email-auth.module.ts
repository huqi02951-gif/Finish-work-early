import { Module } from '@nestjs/common';
import { EmailAuthService } from './email-auth.service';
import { EmailAuthController } from './email-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { getJwtSecret, getJwtSignOptions } from './auth.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        global: true,
        secret: getJwtSecret(),
        signOptions: getJwtSignOptions(),
      }),
    }),
  ],
  controllers: [EmailAuthController],
  providers: [EmailAuthService],
  exports: [EmailAuthService],
})
export class EmailAuthModule {}
