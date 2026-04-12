import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailAuthService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {
    // Initialize nodemailer transporter from env
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else {
      console.warn('[EmailAuth] SMTP not configured. Verification codes will be logged to console.');
    }
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!this.validateEmail(normalizedEmail)) {
      throw new BadRequestException('邮箱格式无效');
    }

    // Check rate limit: max 1 code per 60 seconds
    const recentCode = await this.prisma.verificationCode.findFirst({
      where: {
        type: 'email',
        target: normalizedEmail,
        purpose: 'login',
        used: false,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });

    if (recentCode) {
      throw new BadRequestException('验证码已发送，请 60 秒后再试');
    }

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60_000); // 10 min

    await this.prisma.verificationCode.create({
      data: {
        type: 'email',
        target: normalizedEmail,
        code,
        purpose: 'login',
        expiresAt,
      },
    });

    // Send email
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"Finish Work Early" <${process.env.SMTP_USER}>`,
          to: normalizedEmail,
          subject: '你的登录验证码',
          html: `
            <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;padding:24px;background:#f8fafc;border-radius:16px;">
              <h2 style="color:#0f172a;margin-top:0;">Finish Work Early — 登录验证</h2>
              <p style="color:#475569;font-size:14px;">你的验证码是：</p>
              <div style="background:#fff;border:2px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#0f172a;margin:16px 0;">${code}</div>
              <p style="color:#475569;font-size:12px;">验证码 10 分钟内有效。如果不是你本人操作，请忽略此邮件。</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('[EmailAuth] Failed to send email:', err);
        throw new BadRequestException('邮件发送失败，请稍后再试');
      }
    } else {
      // Dev mode: log code to console
      console.log(`[EmailAuth] Verification code for ${normalizedEmail}: ${code}`);
    }

    return { success: true, message: '验证码已发送' };
  }

  async verifyAndLogin(email: string, code: string): Promise<{ access_token: string; user: object }> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    if (!this.validateEmail(normalizedEmail)) {
      throw new BadRequestException('邮箱格式无效');
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      throw new BadRequestException('验证码格式错误');
    }

    // Find valid code
    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        type: 'email',
        target: normalizedEmail,
        code: normalizedCode,
        purpose: 'login',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verificationCode) {
      throw new BadRequestException('验证码错误或已过期');
    }

    // Mark as used
    await this.prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Auto-register
      const nickname = normalizedEmail.split('@')[0];
      user = await this.prisma.user.create({
        data: {
          username: `email_${normalizedEmail.replace(/[^a-z0-9]/g, '_')}`,
          nickname,
          email: normalizedEmail,
          passwordHash: '', // No password needed for email auth
        },
      });
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }
}
