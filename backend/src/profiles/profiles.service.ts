import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateMyProfile(
    userId: number,
    input: { nickname?: string; avatarUrl?: string | null; bio?: string | null; phone?: string | null },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        nickname: input.nickname?.trim() || undefined,
        avatarUrl: input.avatarUrl === undefined ? undefined : input.avatarUrl,
        bio: input.bio === undefined ? undefined : input.bio,
        phone: input.phone === undefined ? undefined : input.phone,
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
