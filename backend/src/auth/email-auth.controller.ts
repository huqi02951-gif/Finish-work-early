import { Controller, Post, Body } from '@nestjs/common';
import { EmailAuthService } from './email-auth.service';

@Controller('auth')
export class EmailAuthController {
  constructor(private readonly emailAuthService: EmailAuthService) {}

  @Post('email/send-code')
  async sendCode(@Body() body: { email: string }) {
    return this.emailAuthService.sendVerificationCode(body.email);
  }

  @Post('email/verify')
  async verify(@Body() body: { email: string; code: string }) {
    return this.emailAuthService.verifyAndLogin(body.email, body.code);
  }
}
