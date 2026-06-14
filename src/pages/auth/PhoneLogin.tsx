import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Smartphone } from 'lucide-react';
import { apiService } from '../../services/api';
import { setAuthSession } from '../../services/authService';
import { sendSupabasePhoneCode, syncSupabaseProfile, verifySupabasePhoneCode } from '../../services/supabaseAuth';

function normalizePhone(rawPhone: string) {
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('+') && digits.length >= 8) {
    return `+${digits}`;
  }

  if (/^1\d{10}$/.test(digits)) {
    return `+86${digits}`;
  }

  return null;
}

const PhoneLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const from = (location.state as any)?.from || '/';

  const handleSendCode = async () => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setError('请输入手机号。中国大陆手机号可直接输入 11 位，其他地区请使用 +国家码。');
      return;
    }

    setError(null);
    setSending(true);
    try {
      await sendSupabasePhoneCode(normalizedPhone);
      setSuccess(`Supabase 手机验证码已发送至 ${normalizedPhone}`);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setError('请输入有效手机号');
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError('验证码为 6 位数字');
      return;
    }

    setError(null);
    setSuccess(null);
    setVerifying(true);
    try {
      const supabaseSession = await verifySupabasePhoneCode(normalizedPhone, code.trim());
      await syncSupabaseProfile({
        id: supabaseSession.user.id,
        phone: normalizedPhone,
        nickname: normalizedPhone.replace(/^\+86/, ''),
      });

      const result = await apiService.exchangeSupabaseSession(supabaseSession.session.access_token);
      await syncSupabaseProfile({
        id: supabaseSession.user.id,
        email: result.user.email || null,
        phone: result.user.phone || normalizedPhone,
        nickname: result.user.nickname || result.user.username,
        apexUserId: result.user.id,
      });

      setAuthSession({
        accessToken: result.access_token,
        user: {
          id: String(result.user.id),
          nickname: result.user.nickname || result.user.username,
          avatar: '',
          role: result.user.role === 'ADMIN' ? 'admin' : result.user.role === 'MANAGER' ? 'manager' : 'user',
          email: result.user.email,
          phone: result.user.phone || normalizedPhone,
          createdAt: result.user.createdAt,
        },
        loginMethod: 'phone',
        loginTime: new Date().toISOString(),
        supabaseUserId: result.user.supabaseAuthId || supabaseSession.user.id,
      });

      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-brand-gray mb-2">手机号码</label>
        <div className="relative">
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray/40" size={18} />
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="13800000000 / +86..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-brand-border/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-brand-gray mb-2">验证码</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray/40" size={18} />
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6 位验证码"
              maxLength={6}
              className="w-full pl-10 pr-4 py-3 bg-white border border-brand-border/10 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending || countdown > 0}
            className="px-4 py-3 bg-brand-dark text-white rounded-2xl text-xs font-bold whitespace-nowrap disabled:opacity-50 transition-all"
          >
            {sending ? (
              <span className="flex items-center gap-1"><Loader2 size={14} className="animate-spin" />发送中</span>
            ) : countdown > 0 ? (
              `${countdown}s`
            ) : (
              '获取验证码'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-rose-50 border border-rose-200/60 rounded-2xl flex items-start gap-2">
          <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-start gap-2">
          <span className="text-emerald-500 text-sm">●</span>
          <p className="text-xs text-emerald-700">{success}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleVerify}
        disabled={verifying || !phone || !code}
        className="w-full py-3.5 bg-brand-dark text-white rounded-2xl font-bold text-sm shadow-lg disabled:opacity-50 hover:bg-brand-dark/90 transition-all active:scale-[0.98]"
      >
        {verifying ? (
          <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />验证中</span>
        ) : (
          '手机登录 / 注册'
        )}
      </button>

      <p className="text-[11px] text-brand-gray text-center leading-relaxed">
        手机验证码由 Supabase Auth 发送。短信能力需要在 Supabase 控制台启用 SMS Provider。
      </p>
    </div>
  );
};

export default PhoneLogin;
