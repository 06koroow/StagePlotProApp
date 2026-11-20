/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName?: string | null;
}

export interface AuthResult {
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface AuthContextType {
  isConfigured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  signInWithIdentifier: (identifier: string, password: string) => Promise<AuthResult>;
  signUp: (username: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,32}$/;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  const loadProfileForUser = useCallback(async (authUser: User | null) => {
    if (!authUser || !supabase) {
      setProfile(null);
      return;
    }

    const fallbackUsername =
      (authUser.user_metadata?.username as string | undefined) ||
      (authUser.email ? authUser.email.split('@')[0] : 'user');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, email, display_name')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          id: data.id,
          username: data.username,
          email: data.email,
          displayName: data.display_name,
        });
        return;
      }
    } catch {
      // Fall back to auth user metadata if profiles query fails temporarily
    }

    setProfile({
      id: authUser.id,
      username: fallbackUsername,
      email: authUser.email || '',
      displayName: (authUser.user_metadata?.display_name as string | undefined) || fallbackUsername,
    });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        const currentSession = data.session ?? null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        loadProfileForUser(currentSession?.user ?? null).finally(() => {
          if (active) setLoading(false);
        });
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      void loadProfileForUser(nextSession?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfileForUser]);

  const refreshProfile = useCallback(async () => {
    await loadProfileForUser(user);
  }, [loadProfileForUser, user]);

  const signInWithIdentifier = useCallback(
    async (identifier: string, password: string): Promise<AuthResult> => {
      if (!supabase) {
        return { error: 'Supabase environment variables are not configured.' };
      }

      const trimmed = identifier.trim();
      if (!trimmed || !password) {
        return { error: 'Please enter your username or email and password.' };
      }

      let resolvedEmail = trimmed;

      try {
        const { data: rpcEmail, error: rpcError } = await supabase.rpc('resolve_login_email', {
          identifier: trimmed,
        });

        if (!rpcError && typeof rpcEmail === 'string' && rpcEmail.length > 0) {
          resolvedEmail = rpcEmail;
        } else if (!trimmed.includes('@')) {
          return { error: 'No account found with that username.' };
        }
      } catch {
        if (!trimmed.includes('@')) {
          return {
            error:
              'Unable to look up username. Verify the resolve_login_email SQL function exists in Supabase, or sign in using your email address.',
          };
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    },
    []
  );

  const signUp = useCallback(
    async (username: string, email: string, password: string): Promise<AuthResult> => {
      if (!supabase) {
        return { error: 'Supabase environment variables are not configured.' };
      }

      const cleanUsername = username.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!USERNAME_PATTERN.test(cleanUsername)) {
        return {
          error:
            'Username must be 3–32 characters using only letters, numbers, underscores, hyphens, or dots.',
        };
      }

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { error: 'Please enter a valid email address.' };
      }

      if (password.length < 6) {
        return { error: 'Password must be at least 6 characters.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: cleanUsername,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('database error saving new user')) {
          return {
            error:
              'That username may already be taken, or the profiles trigger has not been created yet.',
          };
        }
        return { error: error.message };
      }

      if (data.user && !data.session) {
        return { needsEmailConfirmation: true };
      }

      return {};
    },
    []
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isConfigured: isSupabaseConfigured,
        loading,
        session,
        user,
        profile,
        signInWithIdentifier,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
