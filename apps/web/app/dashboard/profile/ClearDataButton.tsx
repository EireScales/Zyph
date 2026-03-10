'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearDataButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClear = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/clear-data', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[10px] px-4 py-2 text-[0.82rem] font-medium transition hover:opacity-90"
        style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: 'rgba(252,165,165,0.9)',
        }}
      >
        Clear my data
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
          <div className="w-full max-w-md rounded-[20px] border border-white/10 p-8 shadow-xl" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)' }}>
            <h3 className="text-lg font-semibold text-[#f0f0f0]">Clear all your data?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              This will permanently delete all observations and insights Zyph has learned about
              you. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 rounded-lg border border-zinc-600 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Clearing…' : 'Clear everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
