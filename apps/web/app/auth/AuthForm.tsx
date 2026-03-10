'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'signin' | 'signup';

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage({ type: 'error', text: error.message });
          setLoading(false);
          return;
        }
        setMessage({
          type: 'success',
          text: 'Check your email to confirm your account, then sign in.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage({ type: 'error', text: error.message });
          setLoading(false);
          return;
        }
        router.refresh();
        router.push('/dashboard');
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-lg border px-4 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-[#e8837a] focus:ring-1 focus:ring-[#e8837a]"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className="mt-1.5 w-full rounded-lg border px-4 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-[#e8837a] focus:ring-1 focus:ring-[#e8837a]"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          placeholder="••••••••"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === 'error' ? 'text-red-400' : 'text-emerald-400'
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg py-2.5 font-medium text-white transition disabled:opacity-50 hover:opacity-90"
        style={{ background: '#e8837a', border: '1px solid rgba(232,131,122,0.5)' }}
      >
        {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>

      <div className="flex justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
        <span>{mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}</span>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setMessage(null);
          }}
          className="font-medium hover:underline"
          style={{ color: 'rgba(255,190,180,1)' }}
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}
