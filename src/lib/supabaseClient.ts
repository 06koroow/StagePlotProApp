/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

const isPlaceholderUrl =
  !rawUrl ||
  rawUrl.includes('your-project-ref') ||
  rawUrl.includes('MY_SUPABASE_URL') ||
  !rawUrl.startsWith('http');

const isPlaceholderKey =
  !rawAnonKey ||
  rawAnonKey.includes('your-supabase-anon-key') ||
  rawAnonKey.includes('MY_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !isPlaceholderUrl && !isPlaceholderKey;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
