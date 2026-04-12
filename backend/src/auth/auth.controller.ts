import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body.username, body.password, body.nickname);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }

  @Post('demo-session')
  async createDemoSession(@Body() body: any) {
    return this.authService.createOrLoginDemoSession(body.clientKey, body.nickname);
  }
}
