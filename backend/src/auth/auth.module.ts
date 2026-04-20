import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailAuthModule } from './email-auth.module';
import { JwtModule } from '@nestjs/jwt';
import { getJwtSecret, getJwtSignOptions } from './auth.config';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  imports: [
    EmailAuthModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        global: true,
        secret: getJwtSecret(),
        signOptions: getJwtSignOptions(),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
