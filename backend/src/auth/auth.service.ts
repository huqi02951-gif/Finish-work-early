import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  private async signToken(user: { id: number; username: string; role: string }) {
    return this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
  }

  async register(username: string, pass: string, nickname?: string) {
    if (!username || !pass) {
       throw new BadRequestException('Username and password are required');
    }

    const normalizedUsername = username.trim();
    const normalizedNickname = nickname?.trim() || normalizedUsername;

    const existingUser = await this.prisma.user.findUnique({ where: { username: normalizedUsername } });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.prisma.user.create({
      data: {
        username: normalizedUsername,
        nickname: normalizedNickname,
        passwordHash: hashedPassword,
      },
    });

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
    };
  }

  async login(username: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: await this.signToken(user),
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }

  async createOrLoginDemoSession(clientKey: string, nickname?: string) {
    const normalizedClientKey = clientKey?.trim();
    if (!normalizedClientKey) {
      throw new BadRequestException('clientKey is required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { clientKey: normalizedClientKey },
    });

    if (existingUser) {
      return {
        access_token: await this.signToken(existingUser),
        user: {
          id: existingUser.id,
          username: existingUser.username,
          nickname: existingUser.nickname,
          role: existingUser.role,
        },
      };
    }

    const safeClientKey = normalizedClientKey.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'guest';
    const username = `demo_${safeClientKey}`;
    const fallbackNickname = nickname?.trim() || '当前浏览器用户';
    const passwordHash = await bcrypt.hash(randomBytes(16).toString('hex'), 10);

    const user = await this.prisma.user.upsert({
      where: { username },
      update: {
        clientKey: normalizedClientKey,
        nickname: fallbackNickname,
      },
      create: {
        username,
        nickname: fallbackNickname,
        clientKey: normalizedClientKey,
        passwordHash,
      },
    });

    return {
      access_token: await this.signToken(user),
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }
}
