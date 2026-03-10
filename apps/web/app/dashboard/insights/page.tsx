'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatCard, GlassCard } from '../DashboardCard';

type InsightRow = {
  id: string;
  insight_type: string;
  insight_value: string;
  confidence_score: number;
  updated_at: string;
};

function formatInsightType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatRelativeTime(iso: string): string {
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
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function daysSinceFirst(capturedAt: string | null): number {
  if (!capturedAt) return 0;
  const first = new Date(capturedAt);
  const now = new Date();
  return Math.floor((now.getTime() - first.getTime()) / 86400000);
}

const CATEGORY_ORDER = [
  'communication_style',
  'work_patterns',
  'interests',
  'habits',
];

const CATEGORY_COLORS: Record<string, string> = {
  communication_style: 'rgba(124,58,237,0.8)',
  work_patterns: 'rgba(232,131,122,0.8)',
  interests: 'rgba(212,149,106,0.7)',
  habits: 'rgba(180,80,160,0.8)',
};

function sortCategoryKeys(keys: string[]): string[] {
  const set = new Set(CATEGORY_ORDER);
  const ordered = keys.filter((k) => set.has(k));
  const rest = keys.filter((k) => !set.has(k)).sort();
  return [...ordered, ...rest];
}

export default function InsightsPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [firstObservationAt, setFirstObservationAt] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
        return;
      }

      const [
        { data: insightsData },
        { data: firstObs },
      ] = await Promise.all([
        supabase
          .from('user_profile_insights')
          .select('id, insight_type, insight_value, confidence_score, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false }),
        supabase
          .from('observations')
          .select('captured_at')
          .eq('user_id', user.id)
          .order('captured_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      setInsights(insightsData ?? []);
      setFirstObservationAt(firstObs?.captured_at ?? null);
      const latest = insightsData?.[0]?.updated_at ?? null;
      setLastUpdated(latest);
      setLoading(false);
    }
    load();
  }, [router]);

  const totalInsights = insights.length;
  const categoryCounts: Record<string, number> = {};
  insights.forEach((i) => {
    categoryCounts[i.insight_type] = (categoryCounts[i.insight_type] ?? 0) + 1;
  });
  const mostCommonCategory =
    Object.keys(categoryCounts).length > 0
      ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;
  const avgConfidence =
    insights.length > 0
      ? (insights.reduce((s, i) => s + (i.confidence_score ?? 0), 0) / insights.length) * 100
      : 0;
  const daysSinceFirstObs = daysSinceFirst(firstObservationAt);

  const byCategory = insights.reduce<Record<string, InsightRow[]>>((acc, row) => {
    const t = row.insight_type;
    if (!acc[t]) acc[t] = [];
    acc[t].push(row);
    return acc;
  }, {});
  const categoryKeys = sortCategoryKeys(Object.keys(byCategory));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  return (
    <main className="relative z-10 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white/90">Your Insights</h1>
        <p className="mt-1 text-sm text-white/40">
          Patterns Zyph has learned about you
          {lastUpdated && (
            <span className="ml-2 text-white/25">· Last updated {formatRelativeTime(lastUpdated)}</span>
          )}
        </p>
      </header>

      <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total insights generated" value={totalInsights} topBorderColor="rgba(124,58,237,0.8)" />
        <StatCard
          label="Most common category"
          value={mostCommonCategory ? formatInsightType(mostCommonCategory) : '—'}
          valueIsText
          topBorderColor="rgba(232,131,122,0.8)"
        />
        <StatCard
          label="Average confidence"
          value={totalInsights > 0 ? `${Math.round(avgConfidence)}%` : '—'}
          topBorderColor="rgba(212,149,106,0.7)"
        />
        <StatCard label="Days since first observation" value={daysSinceFirstObs} topBorderColor="rgba(180,80,160,0.8)" />
      </section>

      {insights.length === 0 ? (
        <div className="relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-[20px] px-6 py-16" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
            <div
              className="animate-pulse rounded-full blur-[80px]"
              style={{
                width: 300,
                height: 300,
                background: 'rgba(232,131,122,0.15)',
              }}
            />
          </div>
          <h2
            className="relative text-[1.4rem] font-bold"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Zyph is still learning
          </h2>
          <p className="relative mt-2 max-w-sm text-center text-sm text-white/35">
            Keep the desktop app running and insights will appear here within 24 hours.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryKeys.map((type) => (
            <GlassCard key={type} topBorderColor={CATEGORY_COLORS[type] ?? 'rgba(124,58,237,0.8)'}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#7c3aed]">
                {formatInsightType(type)}
              </h2>
              <div className="space-y-4">
                {byCategory[type].map((insight) => (
                  <div key={insight.id}>
                    <p className="text-[0.95rem] leading-relaxed text-white/90">
                      {insight.insight_value}
                    </p>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((insight.confidence_score ?? 0) * 100))}%`,
                          background: 'linear-gradient(90deg, #7c3aed, #e8837a)',
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/30">
                      {Math.round((insight.confidence_score ?? 0) * 100)}% confidence
                      <span className="ml-2">· Updated {formatRelativeTime(insight.updated_at)}</span>
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </main>
  );
}
