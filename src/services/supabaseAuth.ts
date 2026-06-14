import { requireSupabaseClient } from './supabaseClient';

interface SupabaseProfileInput {
  id: string;
  email: string;
  nickname?: string;
  apexUserId?: number;
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
  const { error } = await supabase
    .from('apex_user_profiles')
    .upsert({
      id: profile.id,
      email: profile.email,
      nickname: profile.nickname || profile.email.split('@')[0],
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
