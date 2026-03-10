import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingFlow from './OnboardingFlow';

export const metadata = {
  title: 'Get started | Zyph',
  description: 'Set up your Zyph profile',
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data: profile } = await supabase.from('profiles').select('onboarding_complete').eq('id', user.id).single();
  if (profile?.onboarding_complete) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-[#0a0008]">
      <OnboardingFlow />
    </main>
  );
}
