import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SupabaseAuthService } from './supabase-auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly supabaseAuthService: SupabaseAuthService
  ) {}

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

  @Post('supabase/exchange')
  async exchangeSupabaseSession(@Body() body: { accessToken?: string }, @Req() req) {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice('Bearer '.length)
      : undefined;

    return this.supabaseAuthService.exchange(body?.accessToken || bearerToken);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    // Client-side token removal is sufficient for JWT
    // Server-side session revocation can be added when user_sessions table is actively managed
    return { success: true, message: '已退出登录' };
  }
}
