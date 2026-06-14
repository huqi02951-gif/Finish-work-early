import { requireSupabaseClient } from './supabaseClient';

interface SupabaseProfileInput {
  id: string;
  email?: string | null;
  phone?: string | null;
  nickname?: string;
  apexUserId?: number;
}

function getSupabaseErrorMessage(errorMessage: string, fallback: string) {
  const normalized = errorMessage.toLowerCase();

  if (normalized.includes('unsupported phone provider') || normalized.includes('sms') || normalized.includes('phone')) {
    return 'Supabase 手机验证码未启用或短信服务商未配置，请先在 Supabase Auth 的 SMS Provider 中完成配置。';
  }

  if (normalized.includes('email')) {
    return errorMessage || fallback;
  }

  return errorMessage || fallback;
}

export async function sendSupabaseEmailCode(email: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(error.message || 'Supabase 验证码发送失败');
  }
}

export async function sendSupabasePhoneCode(phone: string) {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error.message, 'Supabase 手机验证码发送失败'));
  }
}

export async function verifySupabasePhoneCode(phone: string, token: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error.message, 'Supabase 手机验证失败'));
  }

  if (!data.session?.access_token || !data.user) {
    throw new Error('Supabase 未返回有效登录会话');
  }

  return data;
}

export async function verifySupabaseEmailCode(email: string, token: string) {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    throw new Error(error.message || 'Supabase 验证失败');
  }

  if (!data.session?.access_token || !data.user) {
    throw new Error('Supabase 未返回有效登录会话');
  }

  return data;
}

export async function syncSupabaseProfile(profile: SupabaseProfileInput) {
  const supabase = requireSupabaseClient();
  const fallbackName = profile.email?.split('@')[0] || profile.phone || 'APEX 用户';
  const { error } = await supabase
    .from('apex_user_profiles')
    .upsert({
      id: profile.id,
      email: profile.email ?? null,
      phone: profile.phone ?? null,
      nickname: profile.nickname || fallbackName,
      apex_user_id: profile.apexUserId ?? null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (error) {
    console.warn('[Supabase] Profile sync skipped:', error.message);
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function signOutSupabase() {
  const supabase = requireSupabaseClient();
  await supabase.auth.signOut();
}
