'use client';

import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GlassCard } from '../DashboardCard';
import ClearDataButton from './ClearDataButton';

function formatInsightType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function getDaysObserved(observations: { captured_at: string }[]): number {
  const days = new Set(observations.map((o) => o.captured_at.slice(0, 10)));
  return days.size;
}

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

const CATEGORY_ORDER = ['communication_style', 'work_patterns', 'interests', 'habits'];

function sortInsightTypes(types: string[]): string[] {
  const orderSet = new Set(CATEGORY_ORDER);
  const ordered = types.filter((t) => orderSet.has(t));
  const rest = types.filter((t) => !orderSet.has(t)).sort();
  return [...ordered, ...rest];
}

type InsightRow = { insight_value: string; confidence_score: number; updated_at?: string };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [insights, setInsights] = useState<{ insight_type: string; insight_value: string; confidence_score: number; updated_at: string }[]>([]);
  const [totalObservations, setTotalObservations] = useState<number>(0);
  const [observationsForDays, setObservationsForDays] = useState<{ captured_at: string }[]>([]);
  const [recentObservations, setRecentObservations] = useState<{ id: string; captured_at: string; screen_summary: string | null; app_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }
      const { data: p } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
      if (!p?.display_name) {
        router.replace('/onboarding');
        return;
      }
      setProfile(p);

      const [
        { data: ins },
        { count },
        { data: obsDays },
        { data: recent },
      ] = await Promise.all([
        supabase.from('user_profile_insights').select('insight_type, insight_value, confidence_score, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('observations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('observations').select('captured_at').eq('user_id', user.id),
        supabase.from('observations').select('id, captured_at, screen_summary, app_name').eq('user_id', user.id).order('captured_at', { ascending: false }).limit(10),
      ]);
      setInsights(ins ?? []);
      setTotalObservations(count ?? 0);
      setObservationsForDays(obsDays ?? []);
      setRecentObservations(recent ?? []);
      setLoading(false);
    })();
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  const daysObserved = getDaysObserved(observationsForDays);
  const avgConfidence = insights.length > 0
    ? (insights.reduce((s, i) => s + (i.confidence_score ?? 0), 0) / insights.length) * 100
    : 0;
  const byType = insights.reduce<Record<string, InsightRow[]>>((acc, i) => {
    const t = i.insight_type;
    if (!acc[t]) acc[t] = [];
    acc[t].push({ insight_value: i.insight_value, confidence_score: i.confidence_score, updated_at: i.updated_at });
    return acc;
  }, {});
  const insightTypes = sortInsightTypes(Object.keys(byType));
  const initial = (profile.display_name || '?').charAt(0).toUpperCase();

  return (
    <main className="relative z-10 max-w-4xl">
      <header className="relative z-10 mb-8 flex items-center justify-between">
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
          Your Zyph Profile
        </h1>
        <ClearDataButton />
      </header>

      <GlassCard topBorderColor="rgba(232,131,122,0.6)" className="mb-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08), transparent 50%)',
          }}
        />
        <div className="relative flex flex-wrap items-center gap-8">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #e8837a)',
              boxShadow: '0 0 30px rgba(232,131,122,0.3)',
            }}
          >
            {initial}
          </div>
          <div>
            <p className="text-[1.3rem] font-bold text-white">{profile.display_name}</p>
            <span
              className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium"
              style={{
                background: 'rgba(124,58,237,0.2)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: 'rgba(196,167,255,0.95)',
              }}
            >
              Powered by Zyph
            </span>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { label: 'Days observed', value: daysObserved },
                { label: 'Total observations', value: totalObservations },
                { label: 'Avg confidence', value: insights.length ? `${Math.round(avgConfidence)}%` : '—' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-[10px] px-5 py-3"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <p className="text-[0.7rem] uppercase tracking-wider text-white/30">{s.label}</p>
                  <p className="mt-1 font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <p
        className="mb-4 mt-8 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-white/25"
      >
        Insight categories
      </p>
      {insightTypes.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <p className="text-sm text-white/40">No insights yet. Use the desktop app and chat to build your profile.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {insightTypes.map((type) => {
            const items = byType[type];
            return (
              <GlassCard key={type} className="mb-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{formatInsightType(type)}</h3>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[0.7rem]"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {items.length}
                  </span>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {items.map((item, i) => (
                    <div key={i} className="py-3 first:pt-0">
                      <p className="text-[0.9rem] text-white/75">{item.insight_value}</p>
                      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-[width] duration-1000 ease-out"
                          style={{
                            width: `${Math.min(100, Math.round((item.confidence_score ?? 0) * 100))}%`,
                            background: 'linear-gradient(90deg, #7c3aed, #e8837a)',
                          }}
                        />
                      </div>
                      <p className="mt-1 text-right text-[0.72rem] text-white/20">
                        {Math.round((item.confidence_score ?? 0) * 100)}%
                        {item.updated_at && ` · ${formatLastUpdated(item.updated_at)}`}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <p
        className="mb-4 mt-8 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-white/25"
      >
        Recent observations
      </p>
      {recentObservations.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <p className="text-sm text-white/30">No observations yet.</p>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="relative pl-6">
            <div
              className="absolute left-[7px] top-2 bottom-2 w-0.5"
              style={{ background: 'rgba(232,131,122,0.3)' }}
            />
            <ul className="space-y-0 divide-y divide-white/[0.04]">
              {recentObservations.map((obs) => (
                <li key={obs.id} className="relative flex gap-4 py-4 first:pt-0">
                  <div
                    className="absolute left-0 top-6 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: '#e8837a',
                      boxShadow: '0 0 8px rgba(232,131,122,0.6)',
                    }}
                  />
                  <div className="min-w-0 flex-1 pl-2">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[0.75rem]"
                    style={{
                      background: 'rgba(232,131,122,0.15)',
                      border: '1px solid rgba(232,131,122,0.25)',
                      color: 'rgba(255,190,180,0.9)',
                    }}
                  >
                    {obs.app_name || 'Unknown'}
                  </span>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-white/60">
                    {obs.screen_summary || 'No summary'}
                  </p>
                  <p className="mt-1 text-[0.75rem] text-white/20">
                    {new Date(obs.captured_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      )}
    </main>
  );
}
