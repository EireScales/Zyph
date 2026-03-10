'use client';

import Link from 'next/link';

const fontFamily = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif";

const headlineWordStyle = {
  display: 'inline-block' as const,
  fontSize: 'clamp(3.8rem, 9vw, 8.5rem)',
  fontWeight: 800,
  letterSpacing: '-0.04em',
  lineHeight: 1.0,
  background:
    'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 25%, rgba(255,200,190,0.9) 50%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.95) 100%)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
  filter:
    'drop-shadow(0 1px 0 rgba(255,255,255,0.4)) drop-shadow(0 2px 0 rgba(200,200,220,0.2)) drop-shadow(0 4px 0 rgba(100,80,140,0.3)) drop-shadow(0 8px 0 rgba(60,40,100,0.2)) drop-shadow(0 12px 20px rgba(0,0,0,0.6))',
  animation: 'breeze 6s ease-in-out infinite',
};

const sectionHeadlineWordStyle = {
  ...headlineWordStyle,
  fontSize: 'clamp(2.8rem, 6vw, 5rem)',
};

const cardTitleGradient = {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 25%, rgba(255,200,190,0.9) 50%, rgba(255,255,255,0.5) 75%, rgba(255,255,255,0.95) 100%)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
};

const howCards = [
  {
    step: '01',
    icon: '👁',
    title: 'Zyph watches quietly',
    subtitle:
      'Install Zyph and it runs silently in the background — no interruptions, no setup.',
    bg: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,0,0,0.2) 100%)',
    topGlow: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.8), transparent)',
    stepChip: {
      background: 'rgba(124,58,237,0.2)',
      border: '1px solid rgba(124,58,237,0.5)',
      color: 'rgba(196,167,255,1)',
      boxShadow: '0 0 16px rgba(124,58,237,0.3)',
    },
  },
  {
    step: '02',
    icon: '🧠',
    title: 'It learns who you are',
    subtitle:
      'Zyph reads your screen, your words and your workflow to build a picture of how you think.',
    bg: 'linear-gradient(135deg, rgba(232,131,122,0.12) 0%, rgba(0,0,0,0.2) 100%)',
    topGlow: 'linear-gradient(90deg, transparent, rgba(232,131,122,0.8), transparent)',
    stepChip: {
      background: 'rgba(232,131,122,0.2)',
      border: '1px solid rgba(232,131,122,0.5)',
      color: 'rgba(255,190,180,1)',
      boxShadow: '0 0 16px rgba(232,131,122,0.3)',
    },
  },
  {
    step: '03',
    icon: '✦',
    title: 'Your profile takes shape',
    subtitle:
      'Over days, Zyph builds a personal intelligence profile — your style, habits and interests.',
    bg: 'linear-gradient(135deg, rgba(212,149,106,0.1) 0%, rgba(0,0,0,0.2) 100%)',
    topGlow: 'linear-gradient(90deg, transparent, rgba(212,149,106,0.7), transparent)',
    stepChip: {
      background: 'rgba(212,149,106,0.2)',
      border: '1px solid rgba(212,149,106,0.5)',
      color: 'rgba(232,190,150,1)',
      boxShadow: '0 0 16px rgba(212,149,106,0.3)',
    },
  },
  {
    step: '04',
    icon: '⚡',
    title: 'AI that already knows you',
    subtitle:
      'When you need help, Zyph responds like someone who has worked beside you for months.',
    bg: 'linear-gradient(135deg, rgba(180,80,180,0.12) 0%, rgba(0,0,0,0.2) 100%)',
    topGlow: 'linear-gradient(90deg, transparent, rgba(180,80,180,0.8), transparent)',
    stepChip: {
      background: 'rgba(180,80,160,0.2)',
      border: '1px solid rgba(180,80,160,0.5)',
      color: 'rgba(230,170,255,1)',
      boxShadow: '0 0 16px rgba(180,80,160,0.3)',
    },
  },
];

const avatarColors = ['#7c3aed', '#e8837a', '#d4956a', '#a855f7', '#c9626b'];

export default function LandingPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-[#0a0008]"
      style={{ fontFamily }}
    >
      {/* Global styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-40px) scale(1.05); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,35px) scale(0.97); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,25px) scale(1.03); } }
        @keyframes breeze { 0% { transform: skewX(-0.5deg) translateX(-2px); } 25% { transform: skewX(0.5deg) translateX(2px); } 50% { transform: skewX(-0.3deg) translateX(-1px); } 75% { transform: skewX(0.3deg) translateX(1px); } 100% { transform: skewX(-0.5deg) translateX(-2px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .nav-sign-in:hover { color: rgba(255,255,255,0.9); }
        .nav-get-started:hover { background: rgba(232,131,122,0.25); transform: scale(1.03); }
        .hero-btn-a:hover { background: rgba(124,58,237,0.4); box-shadow: 0 0 60px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.3); transform: translateY(-2px) scale(1.03); }
        .hero-btn-b:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.95); transform: translateY(-2px); }
        .how-card:hover { transform: translateY(-6px) scale(1.015); box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.14); }
        .cta-btn:hover { background: rgba(232,131,122,0.35); box-shadow: 0 0 60px rgba(232,131,122,0.25), inset 0 1px 0 rgba(255,255,255,0.15); transform: translateY(-2px) scale(1.03); }
        @media (max-width: 768px) {
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `,
        }}
      />

      {/* Background layer — orbs */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div
          className="rounded-full"
          style={{
            position: 'fixed',
            top: '-20%',
            left: '-10%',
            width: 700,
            height: 700,
            background:
              'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float1 14s ease-in-out infinite',
          }}
        />
        <div
          className="rounded-full"
          style={{
            position: 'fixed',
            top: '10%',
            right: '-15%',
            width: 600,
            height: 600,
            background:
              'radial-gradient(circle, rgba(200,90,100,0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float2 18s ease-in-out infinite',
          }}
        />
        <div
          className="rounded-full"
          style={{
            position: 'fixed',
            bottom: '-10%',
            left: '30%',
            width: 800,
            height: 800,
            background:
              'radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animation: 'float3 22s ease-in-out infinite',
          }}
        />
        <div
          className="rounded-full"
          style={{
            position: 'fixed',
            top: '50%',
            left: '20%',
            width: 400,
            height: 400,
            background:
              'radial-gradient(circle, rgba(212,149,106,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float1 16s ease-in-out infinite reverse',
          }}
        />
        <div
          className="rounded-full"
          style={{
            position: 'fixed',
            top: '40%',
            right: '15%',
            width: 350,
            height: 350,
            background:
              'radial-gradient(circle, rgba(180,60,80,0.15) 0%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'float2 15s ease-in-out infinite',
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Navbar */}
      <nav
        className="fixed left-0 right-0 top-0 z-[100] flex h-[60px] items-center justify-between px-10"
        style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link href="/" className="flex items-baseline" style={{ fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          <span style={{ fontWeight: 700, color: 'white' }}>Zyph</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/auth"
            className="nav-sign-in text-sm font-medium transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Sign In
          </Link>
          <Link
            href="/auth"
            className="nav-get-started rounded-full px-5 py-2 text-sm font-semibold transition-all duration-250"
            style={{
              background: 'rgba(232,131,122,0.15)',
              border: '1px solid rgba(232,131,122,0.4)',
              backdropFilter: 'blur(10px)',
              color: 'rgba(255,190,180,1)',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 0 20px rgba(232,131,122,0.2)',
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{
          minHeight: '100vh',
          paddingTop: 60,
        }}
      >
        {/* Badge */}
        <div
          className="hero-badge mb-8 inline-flex items-center rounded-full border px-[18px] py-1.5 font-semibold uppercase"
          style={{
            background: 'rgba(212,149,106,0.12)',
            border: '1px solid rgba(212,149,106,0.35)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            color: 'rgba(232,190,150,0.9)',
            boxShadow:
              '0 0 24px rgba(212,149,106,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
            animation: 'fadeUp 0.6s ease both',
          }}
        >
          <span
            className="mr-2 inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: 'rgba(232,190,150,1)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          />
          NOW IN BETA
        </div>

        {/* Headline */}
        <div
          className="hero-headline max-w-[1000px]"
          style={{
            animation: 'fadeUp 0.8s ease both',
            animationDelay: '0.15s',
          }}
        >
          <h1 className="flex flex-wrap justify-center gap-x-2" style={{ lineHeight: 1 }}>
            <span style={{ ...headlineWordStyle, animationDelay: '0s' }}>Your</span>
            <span style={{ ...headlineWordStyle, animationDelay: '0.2s' }}>AI</span>
            <span style={{ ...headlineWordStyle, animationDelay: '0.4s' }}>that</span>
            <span style={{ ...headlineWordStyle, animationDelay: '0.6s' }}>actually</span>
            <span style={{ ...headlineWordStyle, animationDelay: '0.8s' }}>knows</span>
            <span style={{ ...headlineWordStyle, animationDelay: '1s' }}>you</span>
          </h1>
        </div>

        {/* Subheadline */}
        <p
          className="hero-sub mt-7 max-w-[520px] font-light leading-[1.7]"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.01em',
            animation: 'fadeUp 0.8s ease both',
            animationDelay: '0.3s',
          }}
        >
          Zyph learns from your screen, your words, your work. No setup. No
          prompts. Just results.
        </p>

        {/* Buttons */}
        <div
          className="hero-buttons mt-11 flex flex-wrap justify-center gap-4"
          style={{
            animation: 'fadeUp 0.8s ease both',
            animationDelay: '0.45s',
          }}
        >
          <Link
            href="/auth"
            className="hero-btn-a rounded-full px-9 py-4 font-semibold transition-all duration-300"
            style={{
              background: 'rgba(124,58,237,0.25)',
              border: '1px solid rgba(124,58,237,0.5)',
              backdropFilter: 'blur(20px) saturate(180%)',
              color: 'rgba(210,180,255,1)',
              fontSize: '1rem',
              letterSpacing: '0.01em',
              boxShadow:
                '0 0 40px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            Get Started — it&apos;s free
          </Link>
          <a
            href="#"
            className="hero-btn-b rounded-full border px-9 py-4 font-medium transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1rem',
              boxShadow:
                '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            Download Desktop App
          </a>
        </div>

        {/* Social proof */}
        <div
          className="mt-[52px] flex flex-wrap items-center justify-center gap-4"
          style={{ animation: 'fadeUp 0.8s ease both', animationDelay: '0.5s' }}
        >
          <div className="flex">
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className="rounded-full border-2 border-black/80"
                style={{
                  width: 28,
                  height: 28,
                  background: color,
                  marginRight: -8,
                }}
              />
            ))}
          </div>
          <span
            className="uppercase tracking-[0.08em]"
            style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}
          >
            Trusted by early users across 12 countries
          </span>
        </div>
      </section>

      {/* Divider */}
      <div
        className="mx-auto max-w-[800px]"
        style={{
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.4) 30%, rgba(232,131,122,0.4) 70%, transparent 100%)',
        }}
      />

      {/* How It Works */}
      <section
        className="relative z-10 px-6 pb-40 pt-[140px] text-center"
        style={{ paddingBottom: 160 }}
      >
        <div
          className="mb-6 inline-block rounded-full border px-[18px] py-1.5 font-semibold uppercase"
          style={{
            background: 'rgba(212,149,106,0.12)',
            border: '1px solid rgba(212,149,106,0.35)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            color: 'rgba(232,190,150,0.9)',
            boxShadow:
              '0 0 24px rgba(212,149,106,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          HOW IT WORKS
        </div>

        <h2 className="flex flex-wrap justify-center gap-x-2 font-extrabold tracking-tight">
          <span style={{ ...sectionHeadlineWordStyle, animationDelay: '0s' }}>Zyph</span>
          <span style={{ ...sectionHeadlineWordStyle, animationDelay: '0.2s' }}>becomes</span>
          <span style={{ ...sectionHeadlineWordStyle, animationDelay: '0.4s' }}>you</span>
        </h2>
        <p
          className="mt-3 font-light"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.4rem)',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.02em',
          }}
        >
          Built different. Because you are.
        </p>

        <div
          className="how-grid mx-auto mt-16 grid max-w-[960px] gap-5 px-6"
          style={{
            gridTemplateColumns: 'repeat(2, 1fr)',
          }}
        >
          {howCards.map((card, i) => (
            <div
              key={card.step}
              className="how-card relative overflow-hidden rounded-[28px] text-left"
              style={{
                padding: '48px 44px',
                background: card.bg,
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow:
                  '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)',
                transition: 'all 350ms cubic-bezier(0.34,1.56,0.64,1)',
                animation: `fadeUp 0.7s ease both`,
                animationDelay: `${i * 0.12}s`,
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: card.topGlow,
                }}
              />
              <span
                aria-hidden
                className="select-none"
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  right: '20px',
                  fontSize: '110px',
                  opacity: 0.055,
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}
              >
                {card.icon}
              </span>
              <div className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full text-[0.8rem] font-bold" style={card.stepChip}>
                {card.step}
              </div>
              <div
                className="relative z-10 mt-7 font-extrabold"
                style={{
                  fontSize: 'clamp(1.3rem, 2vw, 1.65rem)',
                  letterSpacing: '-0.02em',
                  ...cardTitleGradient,
                }}
              >
                {card.title}
              </div>
              <p
                className="relative z-10 mt-3 max-w-[320px] text-[0.95rem] font-light leading-[1.7]"
                style={{ color: 'rgba(255,255,255,0.42)' }}
              >
                {card.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p
            className="mb-5 font-medium"
            style={{
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.04em',
            }}
          >
            No account setup. No configuration. Just install and go.
          </p>
          <Link
            href="/auth"
            className="cta-btn inline-block rounded-full px-[52px] py-[18px] font-semibold transition-all duration-300"
            style={{
              background: 'rgba(232,131,122,0.2)',
              border: '1px solid rgba(232,131,122,0.5)',
              backdropFilter: 'blur(20px) saturate(180%)',
              color: 'rgba(255,190,180,1)',
              fontSize: '1.05rem',
              boxShadow:
                '0 0 40px rgba(232,131,122,0.2), inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            Start for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 border-t border-white/5 text-center"
        style={{
          padding: '40px 24px',
          color: 'rgba(255,255,255,0.15)',
          fontSize: '0.8rem',
        }}
      >
        © 2026 Zyph. Built for the people who never stop.
      </footer>
    </main>
  );
}
