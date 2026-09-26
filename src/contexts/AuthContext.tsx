import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { DbProfile, UserRole } from '../lib/database.types';
import { AppMode } from '../types';
import {
  getSession,
  onAuthStateChange,
  fetchProfile,
  fetchProfileWithRetry,
  signInWithEmail,
  signUpWithEmail,
  signOut as authSignOut,
  resetPasswordForEmail,
  mapRoleToAppMode
} from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: DbProfile | null;
  role: UserRole;
  appMode: AppMode;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, fullName?: string, phone?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const role: UserRole = profile?.role || 'customer';
  const appMode: AppMode = mapRoleToAppMode(role);

  const loadCurrentProfile = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId);
    setProfile(p);
    return p;
  }, []);

  // Initialize session and auth state listener
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!isSupabaseConfigured) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 4000)
        );
        const current = await Promise.race([getSession(), timeoutPromise]) as { session: any; user: any; profile: any };
        if (mounted) {
          setSession(current.session);
          setUser(current.user);
          setProfile(current.profile);
        }
      } catch (err) {
        console.warn('Auth init timeout or error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    const { data: { subscription } } = onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await loadCurrentProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [loadCurrentProfile]);

  const refreshProfile = async () => {
    if (user) {
      await loadCurrentProfile(user.id);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    const result = await signInWithEmail(email, pass);
    setIsLoading(false);

    if (result.error) {
      return { error: result.error.message };
    }
    setUser(result.user);
    setSession(result.session);
    setProfile(result.profile);
    return {};
  };

  const signUp = async (email: string, pass: string, fullName?: string, phone?: string) => {
    setIsLoading(true);
    const result = await signUpWithEmail(email, pass, fullName, phone);
    setIsLoading(false);

    if (result.error) {
      return { error: result.error.message };
    }
    setUser(result.user);
    setSession(result.session);
    setProfile(result.profile);
    return {};
  };

  const signOut = async () => {
    setIsLoading(true);
    await authSignOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    const result = await resetPasswordForEmail(email);
    if (result.error) {
      return { error: result.error.message };
    }
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        appMode,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
