'use client';

import type { Challenge, User } from '@/types/fitness';

interface HudHeaderProps {
  operator: User | null;
  activeChallenge?: Challenge;
}

export function HudHeader({ operator, activeChallenge }: HudHeaderProps) {
  const operatorName = operator?.display_name || 'OPERATOR';
  const label = activeChallenge ? activeChallenge.name : 'NO ACTIVE PROTOCOL';

  return (
    <header className="h-14 bg-black/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
      <div className="min-w-0">
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.45em]">
          {'// System ready'}
        </div>
        <div className="mt-1 text-sm font-black tracking-[0.3em] uppercase text-slate-200 truncate">
          {label}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-mono text-slate-400 tracking-[0.35em] uppercase">
            Online
          </span>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.45em]">
            Operator
          </div>
          <div className="mt-1 text-xs font-mono text-slate-200 truncate max-w-[200px]">
            {operatorName}
          </div>
        </div>
      </div>
    </header>
  );
}
