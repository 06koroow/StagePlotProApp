/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Database,
  X,
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'signin' }) => {
  const { isConfigured, user, profile, signInWithIdentifier, signUp, signOut } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setSubmitting(true);
    try {
      const res = await signInWithIdentifier(identifier, password);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await signUp(username, email, password);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.needsEmailConfirmation) {
        setSuccessMsg(
          'Account created! Please check your email inbox to confirm your address before signing in.'
        );
        setPassword('');
        setConfirmPassword('');
      } else {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    try {
      await signOut();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {user ? 'Cloud Account' : mode === 'signin' ? 'Sign In to Cloud Sync' : 'Create Cloud Account'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Missing Supabase Env Config View */}
          {!isConfigured ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-amber-100">
                    Supabase environment variables not detected
                  </div>
                  <p className="text-amber-200/80 leading-relaxed">
                    To enable user accounts and cloud project syncing, configure these environment
                    variables for your app and reload:
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-md p-3 font-mono text-[11px] text-slate-300 space-y-1">
                <div>
                  <span className="text-sky-400">VITE_SUPABASE_URL</span>
                  <span className="text-slate-500">=https://your-project-ref.supabase.co</span>
                </div>
                <div>
                  <span className="text-sky-400">VITE_SUPABASE_ANON_KEY</span>
                  <span className="text-slate-500">=your-supabase-anon-key</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your local workspace continues to auto-save in this browser and supports JSON
                export/import at any time.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          ) : user ? (
            /* Signed-in Account Overview */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-md bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-300 font-bold text-sm uppercase shrink-0">
                  {(profile?.username || user.email || 'U').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-100 text-sm truncate">
                    @{profile?.username || 'user'}
                  </div>
                  <div className="text-slate-400 truncate">{profile?.email || user.email}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold uppercase tracking-wide">
                  Connected
                </span>
              </div>

              <p className="text-slate-400 leading-relaxed">
                Your saved stage plots, channel lists, monitor patches, and custom gear library
                sync securely to your Supabase workspace.
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span>Sign Out</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Sign Up Forms */
            <div className="space-y-4">
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    resetMessages();
                  }}
                  className={`py-1.5 rounded font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    mode === 'signin'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    resetMessages();
                  }}
                  className={`py-1.5 rounded font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    mode === 'signup'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {mode === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">
                      Username or Email
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="foh_alex or alex@production.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Username</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. foh_engineer"
                        className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      3–32 characters: letters, numbers, underscore, hyphen, or dot.
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@production.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-medium block mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
