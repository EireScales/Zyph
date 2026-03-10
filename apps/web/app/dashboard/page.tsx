'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatCard, GlassCard } from './DashboardCard';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getTopApp(observations: { app_name: string | null }[]): string {
  const counts: Record<string, number> = {};
  let top = '';
  let max = 0;
  for (const o of observations) {
    const app = o.app_name?.trim() || 'Unknown';
    counts[app] = (counts[app] ?? 0) + 1;
    if (counts[app] > max) {
      max = counts[app];
      top = app;
    }
  }
  return top || '—';
}

function getDaysActive(observations: { captured_at: string }[]): number {
  const days = new Set(observations.map((o) => o.captured_at.slice(0, 10)));
  return days.size;
}

function formatObservationTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function formatInsightType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export default function DashboardPage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [totalObservations, setTotalObservations] = useState<number>(0);
  const [observationsForStats, setObservationsForStats] = useState<{ captured_at: string; app_name: string | null }[]>([]);
  const [recentObservations, setRecentObservations] = useState<{ id: string; captured_at: string; app_name: string | null; screen_summary: string | null }[]>([]);
  const [insightsCount, setInsightsCount] = useState<number>(0);
  const [latestInsights, setLatestInsights] = useState<{ insight_type: string; insight_value: string }[]>([]);
  const [clock, setClock] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
      if (!profile?.display_name) {
        router.replace('/onboarding');
        return;
      }
      setName(profile.display_name);

      const [
        { count },
        { data: obsStats },
        { data: recent },
        { count: insCount },
        { data: insights },
      ] = await Promise.all([
        supabase.from('observations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('observations').select('captured_at, app_name').eq('user_id', user.id).order('captured_at', { ascending: false }).limit(500),
        supabase.from('observations').select('id, captured_at, app_name, screen_summary').eq('user_id', user.id).order('captured_at', { ascending: false }).limit(5),
        supabase.from('user_profile_insights').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_profile_insights').select('insight_type, insight_value').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(3),
      ]);
      setTotalObservations(count ?? 0);
      setObservationsForStats(obsStats ?? []);
      setRecentObservations(recent ?? []);
      setInsightsCount(insCount ?? 0);
      setLatestInsights(insights ?? []);
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (loading || name === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  const greeting = getGreeting();
  const daysActive = getDaysActive(observationsForStats);
  const topApp = getTopApp(observationsForStats);

  return (
    <main className="relative z-10">
      <header className="relative z-10 mb-12 flex items-start justify-between">
        <div>
          <h1
            className="font-bold tracking-tight"
            style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {greeting}, {name}
          </h1>
          <p className="mt-1.5 text-[0.95rem] text-white/30">
            Here&apos;s what Zyph has been learning.
          </p>
        </div>
        <span className="text-[0.8rem] text-white/20">{clock}</span>
      </header>

      <section className="relative z-10 grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ marginBottom: 48 }}>
        <StatCard label="Total Observations" value={totalObservations} topBorderColor="rgba(124,58,237,0.8)" />
        <StatCard label="Days Active" value={daysActive} topBorderColor="rgba(232,131,122,0.8)" />
        <StatCard label="Insights Generated" value={insightsCount} topBorderColor="rgba(212,149,106,0.7)" />
        <StatCard label="Top App Used" value={topApp} valueIsText topBorderColor="rgba(180,80,160,0.8)" />
      </section>

      <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_360px]" style={{ marginTop: 24 }}>
        {/* Left: Recent Activity */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent activity</h2>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.1em]"
              style={{
                background: 'rgba(34,197,94,0.15)',
                borderColor: 'rgba(34,197,94,0.3)',
                color: 'rgba(134,239,172,1)',
              }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              LIVE
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentObservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="text-5xl opacity-10">👁</span>
                <p className="mt-3 text-sm text-white/20">No observations yet</p>
              </div>
            ) : (
              recentObservations.map((obs) => (
                <div key={obs.id} className="flex gap-3 py-3.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[0.75rem] font-medium"
                    style={{
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      color: 'rgba(196,167,255,1)',
                    }}
                  >
                    {(obs.app_name || '?').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.9rem] font-medium text-white/85">
                      {obs.app_name || 'Unknown app'}
                    </p>
                    {obs.screen_summary && (
                      <p className="mt-0.5 line-clamp-2 text-[0.8rem] text-white/35">
                        {obs.screen_summary}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[0.72rem] text-white/20">
                    {formatObservationTime(obs.captured_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <GlassCard className="mb-0">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-semibold text-white">Your AI Profile</h2>
              <Link
                href="/dashboard/profile"
                className="text-[0.8rem] font-medium"
                style={{ color: 'rgba(232,131,122,0.95)' }}
              >
                View full profile →
              </Link>
            </div>
            <p className="mb-4 text-[0.8rem] text-white/25">What Zyph has learned about you</p>
            <div className="flex flex-wrap gap-2">
              {latestInsights.length === 0 ? (
                <p className="text-[0.82rem] text-white/20">
                  No insights yet. Keep the desktop app running.
                </p>
              ) : (
                latestInsights.map((insight, i) => (
                  <span
                    key={i}
                    className="inline-flex rounded-full px-3.5 py-1.5 text-[0.78rem]"
                    style={{
                      background: 'rgba(212,149,106,0.1)',
                      border: '1px solid rgba(212,149,106,0.25)',
                      color: 'rgba(232,190,150,0.9)',
                    }}
                  >
                    {formatInsightType(insight.insight_type)}: {insight.insight_value.slice(0, 30)}
                    {insight.insight_value.length > 30 ? '…' : ''}
                  </span>
                ))
              )}
            </div>
          </GlassCard>

          <Link
            href="/dashboard/chat"
            className="group block rounded-[20px] p-6 transition-opacity hover:opacity-95"
            style={{
              background: 'linear-gradient(135deg, rgba(232,131,122,0.15) 0%, rgba(124,58,237,0.12) 100%)',
              border: '1px solid rgba(232,131,122,0.25)',
              boxShadow: '0 0 40px rgba(232,131,122,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <h3 className="text-[1.1rem] font-bold text-white">Chat with Zyph</h3>
            <p className="mt-1 text-[0.85rem] text-white/40">Your AI is ready.</p>
            <span
              className="mt-4 flex w-full items-center justify-center rounded-xl py-3 font-semibold text-white transition-colors group-hover:bg-[rgba(232,131,122,0.5)]"
              style={{
                background: 'rgba(232,131,122,0.3)',
                border: '1px solid rgba(232,131,122,0.5)',
              }}
            >
              Open Chat
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
