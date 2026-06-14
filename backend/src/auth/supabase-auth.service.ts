import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

type SupabaseUserMetadata = {
  nickname?: unknown;
  name?: unknown;
  full_name?: unknown;
};

@Injectable()
export class SupabaseAuthService {
  private readonly supabase: SupabaseClient | null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

    this.supabase = supabaseUrl && supabaseKey
      ? createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })
      : null;
  }

  private ensureClient() {
    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase Auth bridge is not configured');
    }

    return this.supabase;
  }

  private async signToken(user: { id: number; username: string; role: string }) {
    return this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
  }

  private getDisplayName(email: string, metadata: SupabaseUserMetadata = {}) {
    const candidates = [metadata.nickname, metadata.name, metadata.full_name];
    const name = candidates.find((item) => typeof item === 'string' && item.trim().length > 0);

    return typeof name === 'string' ? name.trim() : email.split('@')[0];
  }

  async exchange(accessToken: string) {
    const normalizedToken = accessToken?.trim();

    if (!normalizedToken) {
      throw new UnauthorizedException('Supabase access token is required');
    }

    const supabase = this.ensureClient();
    const { data, error } = await supabase.auth.getUser(normalizedToken);

    if (error || !data.user?.id || !data.user.email) {
      throw new UnauthorizedException('Supabase session is invalid');
    }

    const supabaseAuthId = data.user.id;
    const email = data.user.email.trim().toLowerCase();
    const nickname = this.getDisplayName(email, data.user.user_metadata as SupabaseUserMetadata);

    const existingBySupabaseId = await this.prisma.user.findUnique({
      where: { supabaseAuthId },
    });

    const existingByEmail = existingBySupabaseId
      ? null
      : await this.prisma.user.findUnique({ where: { email } });

    const user = existingBySupabaseId || existingByEmail
      ? await this.prisma.user.update({
          where: { id: (existingBySupabaseId || existingByEmail)!.id },
          data: {
            supabaseAuthId,
            email,
            nickname: (existingBySupabaseId || existingByEmail)!.nickname || nickname,
          },
        })
      : await this.prisma.user.create({
          data: {
            username: `supabase_${supabaseAuthId.replace(/-/g, '').slice(0, 24)}`,
            nickname,
            email,
            supabaseAuthId,
            passwordHash: await bcrypt.hash(randomBytes(24).toString('hex'), 10),
          },
        });

    return {
      access_token: await this.signToken(user),
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        supabaseAuthId: user.supabaseAuthId,
      },
    };
  }
}
