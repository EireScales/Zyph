'use client';

/** Shared stat card: glass style + optional colored top border */
export function StatCard({
  label,
  value,
  valueIsText = false,
  topBorderColor,
}: {
  label: string;
  value: number | string;
  valueIsText?: boolean;
  topBorderColor?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {topBorderColor && (
        <div
          className="absolute left-0 right-0 top-0 h-px"
          style={{ background: topBorderColor }}
        />
      )}
      <div
        className="pointer-events-none absolute -left-8 -top-8 h-[100px] w-[100px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent)',
          filter: 'blur(20px)',
        }}
      />
      <p
        className="relative text-[0.7rem] font-medium uppercase tracking-[0.1em] text-white/30"
      >
        {label}
      </p>
      <p
        className={`relative mt-2 truncate font-bold text-white ${valueIsText ? 'text-lg' : 'text-2xl'}`}
      >
        {value}
      </p>
    </div>
  );
}

/** Shared glass card for content sections */
export function GlassCard({
  children,
  className = '',
  topBorderColor,
}: {
  children: React.ReactNode;
  className?: string;
  topBorderColor?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] p-7 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {topBorderColor && (
        <div
          className="absolute left-0 right-0 top-0 h-px"
          style={{ background: topBorderColor }}
        />
      )}
      {children}
    </div>
  );
}
