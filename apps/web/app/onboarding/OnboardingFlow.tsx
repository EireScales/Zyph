'use client';

import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STEPS = 3;
const USE_OPTIONS = ['Work', 'Creative', 'Learning', 'Communication'] as const;

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [primaryUses, setPrimaryUses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const progress = (step / STEPS) * 100;

  const toggleUse = (value: string) => {
    setPrimaryUses((prev) =>
      prev.includes(value) ? prev.filter((u) => u !== value) : [...prev, value]
    );
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Session expired. Please sign in again.');
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id);
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    setStep(2);
    setLoading(false);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Session expired. Please sign in again.');
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ primary_uses: primaryUses })
      .eq('id', user.id);
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    setStep(3);
    setLoading(false);
  };

  const handleStep3Complete = async () => {
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Session expired. Please sign in again.');
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ onboarding_complete: true })
      .eq('id', user.id);
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    router.refresh();
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      {/* Progress bar */}
      <div className="mb-12 h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: '#e8837a' }}
        />
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#f0f0f0]">What&apos;s your name?</h2>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            required
            autoFocus
            className="w-full rounded-lg border px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#e8837a] focus:ring-1 focus:ring-[#e8837a]"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 font-medium text-white transition disabled:opacity-50 hover:opacity-90"
            style={{ background: '#e8837a', border: '1px solid rgba(232,131,122,0.5)' }}
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#f0f0f0]">
            What do you mainly use your computer for?
          </h2>
          <p className="text-zinc-400">Select all that apply.</p>
          <div className="flex flex-wrap gap-3">
            {USE_OPTIONS.map((opt) => {
              const selected = primaryUses.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleUse(opt)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    selected ? '' : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20'
                  }`}
                  style={selected ? { borderColor: '#e8837a', background: 'rgba(232,131,122,0.15)', color: 'rgba(255,190,180,1)' } : undefined}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 font-medium text-white transition disabled:opacity-50 hover:opacity-90"
            style={{ background: '#e8837a', border: '1px solid rgba(232,131,122,0.5)' }}
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#f0f0f0]">
            Download Zyph to start learning
          </h2>
          <p className="text-zinc-400">
            Zyph runs in the background and learns how you work.
          </p>
          <a
            href="#"
            className="block w-full rounded-lg border py-3 text-center font-medium transition hover:opacity-90"
            style={{ borderColor: 'rgba(232,131,122,0.5)', background: 'rgba(232,131,122,0.1)', color: 'rgba(255,190,180,1)' }}
          >
            Download for Windows
          </a>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={handleStep3Complete}
            disabled={loading}
            className="w-full rounded-lg bg-[#7c3aed] py-3 font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Continue to Dashboard'}
          </button>
        </div>
      )}
    </div>
  );
}
