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

  private getDisplayName(primaryIdentity: string, metadata: SupabaseUserMetadata = {}) {
    const candidates = [metadata.nickname, metadata.name, metadata.full_name];
    const name = candidates.find((item) => typeof item === 'string' && item.trim().length > 0);

    return typeof name === 'string' ? name.trim() : primaryIdentity.replace(/^\+86/, '').split('@')[0];
  }

  async exchange(accessToken: string) {
    const normalizedToken = accessToken?.trim();

    if (!normalizedToken) {
      throw new UnauthorizedException('Supabase access token is required');
    }

    const supabase = this.ensureClient();
    const { data, error } = await supabase.auth.getUser(normalizedToken);

    if (error || !data.user?.id) {
      throw new UnauthorizedException('Supabase session is invalid');
    }

    const supabaseAuthId = data.user.id;
    const email = data.user.email?.trim().toLowerCase() || null;
    const phone = data.user.phone?.trim() || null;

    if (!email && !phone) {
      throw new UnauthorizedException('Supabase session has no email or phone identity');
    }

    const nickname = this.getDisplayName(email || phone!, data.user.user_metadata as SupabaseUserMetadata);

    const existingBySupabaseId = await this.prisma.user.findUnique({
      where: { supabaseAuthId },
    });

    const existingByEmail = existingBySupabaseId
      ? null
      : email
        ? await this.prisma.user.findUnique({ where: { email } })
        : null;

    const existingByPhone = existingBySupabaseId || existingByEmail
      ? null
      : phone
        ? await this.prisma.user.findUnique({ where: { phone } })
        : null;

    const existingUser = existingBySupabaseId || existingByEmail || existingByPhone;

    const user = existingUser
      ? await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            supabaseAuthId,
            email,
            phone,
            nickname: existingUser.nickname || nickname,
          },
        })
      : await this.prisma.user.create({
          data: {
            username: `supabase_${supabaseAuthId.replace(/-/g, '').slice(0, 24)}`,
            nickname,
            email,
            phone,
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
