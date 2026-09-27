import { createClient } from '@supabase/supabase-js';

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const isValidSupabaseUrl = (() => {
  if (!/^https?:\/\//i.test(configuredSupabaseUrl)) return false;
  try {
    const url = new URL(configuredSupabaseUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
})();
const supabaseUrl = isValidSupabaseUrl
  ? configuredSupabaseUrl
  : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  isValidSupabaseUrl &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !configuredSupabaseUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
