import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardNav from './DashboardNav';

export const metadata = {
  title: 'Dashboard | Zyph',
  description: 'Your Zyph dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  return (
    <div className="min-h-screen bg-[#0a0008]">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 z-30 h-screen w-[200px] pt-6"
        style={{
          background: 'rgba(10,0,8,0.85)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link
          href="/dashboard"
          className="mb-10 block pl-6 font-bold text-white"
          style={{ fontSize: '1.2rem', letterSpacing: '-0.02em' }}
        >
          Zyph
        </Link>
        <DashboardNav />
      </aside>

      {/* Main content area: marginLeft 200px, padding, background glow behind children */}
      <div
        className="relative min-h-screen pl-[200px]"
        style={{ background: '#0a0008' }}
      >
        {/* Background glow orbs */}
        <div
          className="pointer-events-none fixed left-[200px] right-0 top-0 bottom-0 z-0"
          aria-hidden
        >
          <div
            className="absolute right-0 top-0 rounded-full"
            style={{
              width: 500,
              height: 500,
              background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent)',
              filter: 'blur(100px)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 rounded-full"
            style={{
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(232,131,122,0.06), transparent)',
              filter: 'blur(80px)',
              transform: 'translate(-20%, 20%)',
            }}
          />
        </div>

        {/* Page wrapper: padding for all pages except chat (chat page will override with full height) */}
        <div className="relative z-10 min-h-screen py-12 px-12">
          {children}
        </div>
      </div>
    </div>
  );
}
