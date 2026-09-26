import { supabase, isSupabaseConfigured } from './supabase';
import { DbProfile, UserRole } from './database.types';
import { AppMode } from '../types';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export function mapRoleToAppMode(role?: UserRole): AppMode {
  if (role === 'admin') return 'admin';
  if (role === 'business_owner' || role === 'staff') return 'business';
  return 'client';
}

export async function fetchProfile(userId: string): Promise<DbProfile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile:', error.message);
      return null;
    }
    return data as DbProfile;
  } catch (err) {
    console.warn('Profile fetch exception:', err);
    return null;
  }
}

export async function fetchProfileWithRetry(userId: string, retries = 3, delayMs = 600): Promise<DbProfile | null> {
  for (let i = 0; i < retries; i++) {
    const profile = await fetchProfile(userId);
    if (profile) return profile;
    if (i < retries - 1) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  return null;
}

export async function getSession(): Promise<{ session: Session | null; user: User | null; profile: DbProfile | null }> {
  if (!isSupabaseConfigured) {
    return { session: null, user: null, profile: null };
  }
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return { session: null, user: null, profile: null };
    }
    const profile = await fetchProfile(session.user.id);
    return { session, user: session.user, profile };
  } catch (err) {
    console.warn('Failed to retrieve session:', err);
    return { session: null, user: null, profile: null };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
  phone?: string
): Promise<{ user: User | null; session: Session | null; profile: DbProfile | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      session: null,
      profile: null,
      error: new Error('Supabase is not configured yet. Please check your environment variables.')
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
        phone: phone || ''
      }
    }
  });

  if (error) {
    return { user: null, session: null, profile: null, error };
  }

  const user = data.user;
  let profile: DbProfile | null = null;
  if (user) {
    profile = await fetchProfileWithRetry(user.id);
  }

  return { user, session: data.session, profile, error: null };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; profile: DbProfile | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      session: null,
      profile: null,
      error: new Error('Supabase is not configured yet. Please check your environment variables.')
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { user: null, session: null, profile: null, error };
  }

  const user = data.user;
  let profile: DbProfile | null = null;
  if (user) {
    profile = await fetchProfile(user.id);
  }

  return { user, session: data.session, profile, error: null };
}

export async function signOut(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPasswordForEmail(email: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured') };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  if (!isSupabaseConfigured) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}
