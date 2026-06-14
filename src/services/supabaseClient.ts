import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://oibwkknjgtkyxntyuybb.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_5WaJd8T6zSokZLONkG_vIw_kluHa7u7';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL) as string | undefined;
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY
) as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase 未配置：请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  return supabase;
}
