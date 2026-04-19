import type { JwtSignOptions } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

const INSECURE_FALLBACK_SECRET = 'FINISH_WORK_PHASE_1_SECRET';
const DEFAULT_JWT_EXPIRES_IN = '7d';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret || secret === INSECURE_FALLBACK_SECRET) {
    throw new Error('JWT_SECRET is required and must not use an insecure fallback value');
  }

  return secret;
}

export function getJwtSignOptions(): JwtSignOptions {
  return {
    expiresIn: process.env.JWT_EXPIRES_IN?.trim() || DEFAULT_JWT_EXPIRES_IN,
  };
}

export function isDemoAuthEnabled(): boolean {
  const raw = process.env.ENABLE_DEMO_AUTH?.trim().toLowerCase();

  if (!raw) {
    return process.env.NODE_ENV !== 'production';
  }

  return ['1', 'true', 'yes', 'on'].includes(raw);
}

export function assertDemoAuthEnabled() {
  if (!isDemoAuthEnabled()) {
    throw new UnauthorizedException('Demo session is disabled');
  }
}
