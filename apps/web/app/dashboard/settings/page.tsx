'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GlassCard } from '../DashboardCard';

type Profile = {
  display_name: string | null;
  settings: {
    captureFrequencySeconds?: number;
    captureWhenIdle?: boolean;
    categoriesToTrack?: string[];
    dataRetentionDays?: number | null;
  } | null;
};

const FREQUENCY_OPTIONS = [
  { label: 'Every 30s', value: 30 },
  { label: 'Every 60s', value: 60 },
  { label: 'Every 2 mins', value: 120 },
];

const RETENTION_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: 'Forever', value: null },
];

const CATEGORY_OPTIONS = ['Work', 'Communication', 'Entertainment', 'Learning', 'Shopping', 'Social'];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [frequency, setFrequency] = useState(30);
  const [captureWhenIdle, setCaptureWhenIdle] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [retention, setRetention] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        router.replace('/auth');
        return;
      }
      setUser(u);
      const { data: p } = await supabase.from('profiles').select('display_name, settings').eq('id', u.id).single();
      if (p) {
        setProfile(p as Profile);
        setDisplayName((p.display_name as string) ?? '');
        const s = (p.settings as Profile['settings']) ?? {};
        setFrequency(s.captureFrequencySeconds ?? 30);
        setCaptureWhenIdle(s.captureWhenIdle ?? true);
        setCategories(s.categoriesToTrack ?? []);
        setRetention(s.dataRetentionDays ?? null);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function saveRetentionWithValue(value: number | null) {
    if (!user) return;
    const supabase = createClient();
    const settings = { ...(profile?.settings ?? {}), dataRetentionDays: value };
    await supabase.from('profiles').update({ settings }).eq('id', user.id);
    setProfile((prev) => (prev ? { ...prev, settings } : { display_name: null, settings }));
    showToast();
  }

  async function saveDisplayName() {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('profiles').update({ display_name: displayName.trim() || null }).eq('id', user.id);
    showToast();
  }

  async function saveCaptureSettings() {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const settings = {
      ...(profile?.settings ?? {}),
      captureFrequencySeconds: frequency,
      captureWhenIdle,
      categoriesToTrack: categories,
      dataRetentionDays: retention,
    };
    await supabase.from('profiles').update({ settings }).eq('id', user.id);
    setProfile((prev) => (prev ? { ...prev, settings } : { display_name: null, settings }));
    setSaving(false);
    showToast();
  }

  function showToast() {
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }

  function toggleCategory(cat: string) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.push('/');
  }

  async function handleDeleteAll() {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/profile/clear-data', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setDeleteOpen(false);
        router.push('/');
        router.refresh();
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  const initial = (displayName || user?.email || '?').charAt(0).toUpperCase();

  return (
    <main className="relative z-10 max-w-2xl">
      <header className="mb-10">
        <h1
          className="font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            letterSpacing: '-0.03em',
          }}
        >
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-white/40">Manage your Zyph account</p>
      </header>

      <div className="space-y-6">
        {/* Card 1 — Account */}
        <GlassCard>
          <p className="mb-5 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-white/30">
            Account
          </p>
          <div className="flex items-center gap-4">
            <div
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #e8837a)',
                boxShadow: '0 0 20px rgba(232,131,122,0.25)',
              }}
            >
              {initial}
            </div>
            <div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={saveDisplayName}
                placeholder="Your name"
                className="border-0 bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/30"
              />
              <p className="mt-0.5 text-[0.82rem] text-white/30">{user?.email ?? ''}</p>
            </div>
          </div>
          <div className="my-5 h-px bg-white/[0.05]" />
          <div>
            <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-wider text-white/30">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={saveDisplayName}
              placeholder="Your name"
              className="w-full rounded-[10px] border px-4 py-2.5 text-[0.9rem] text-white outline-none transition placeholder:text-white/25 focus:border-[rgba(232,131,122,0.4)]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>
        </GlassCard>

        {/* Card 2 — Capture Preferences */}
        <GlassCard>
          <p className="mb-5 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-white/30">
            Capture preferences
          </p>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm text-white/80">Capture frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="rounded-[10px] border px-4 py-2 text-[0.9rem] text-white"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/80">Capture when idle</label>
              <button
                type="button"
                role="switch"
                aria-checked={captureWhenIdle}
                onClick={() => setCaptureWhenIdle((v) => !v)}
                className="relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200"
                style={{
                  background: captureWhenIdle ? 'rgba(232,131,122,0.6)' : 'rgba(255,255,255,0.1)',
                  borderColor: captureWhenIdle ? 'rgba(232,131,122,0.8)' : 'rgba(255,255,255,0.15)',
                }}
              >
                <span
                  className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200"
                  style={{ left: captureWhenIdle ? 23 : 3 }}
                />
              </button>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">Track categories</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const checked = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="rounded-full border px-4 py-2 text-left text-[0.85rem] transition duration-200"
                      style={{
                        background: checked ? 'rgba(232,131,122,0.15)' : 'rgba(255,255,255,0.03)',
                        borderColor: checked ? 'rgba(232,131,122,0.4)' : 'rgba(255,255,255,0.08)',
                        color: checked ? 'rgba(255,190,180,1)' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={saveCaptureSettings}
              disabled={saving}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition duration-200 disabled:opacity-50 hover:brightness-125"
              style={{
                background: 'linear-gradient(135deg, rgba(232,131,122,0.35), rgba(124,58,237,0.25))',
                border: '1px solid rgba(232,131,122,0.4)',
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </GlassCard>

        {/* Card 3 — Danger Zone */}
        <div
          className="relative overflow-hidden rounded-[20px] p-7"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(239,68,68,0.1)',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <p className="mb-5 text-[0.7rem] font-medium uppercase tracking-[0.1em]" style={{ color: 'rgba(252,165,165,0.4)' }}>
            Danger zone
          </p>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm text-white/80">Data retention</label>
              <select
                value={retention ?? 'forever'}
                onChange={(e) => {
                  const v = e.target.value === 'forever' ? null : Number(e.target.value);
                  setRetention(v);
                  saveRetentionWithValue(v);
                }}
                className="rounded-[10px] border px-4 py-2 text-[0.9rem] text-white"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {RETENTION_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? 'forever'}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="w-full rounded-xl border py-3 text-sm font-semibold transition duration-200 hover:opacity-90"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: 'rgba(252,165,165,0.8)',
              }}
            >
              Delete all my data
            </button>
          </div>
        </div>

        {/* Sign out — separate or inside a card; spec didn't say, keeping simple */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
        >
          <div
            className="w-full max-w-[400px] rounded-[20px] border p-8"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <h3 className="text-[1.2rem] font-bold text-white">Are you sure?</h3>
            <p className="mt-4 mb-4 text-[0.88rem] leading-relaxed text-white/50">
              This will permanently delete all your observations, insights and profile data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/80 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={deleteLoading}
                className="flex-1 rounded-xl border py-3 text-sm font-semibold text-white disabled:opacity-50"
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  borderColor: 'rgba(239,68,68,0.4)',
                  color: 'rgba(252,165,165,0.95)',
                }}
              >
                {deleteLoading ? 'Deleting…' : 'Confirm delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-5 py-3 text-[0.85rem] font-medium"
          style={{
            background: 'rgba(232,131,122,0.12)',
            borderColor: 'rgba(232,131,122,0.3)',
            color: 'rgba(255,190,180,1)',
            backdropFilter: 'blur(10px)',
            animation: 'settings-toast-in 0.25s ease-out',
          }}
        >
          ✓ Settings saved
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes settings-toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </main>
  );
}
