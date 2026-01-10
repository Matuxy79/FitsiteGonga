'use client';

import { useMemo } from 'react';
import { Apple, Dumbbell, HeartPulse, LogOut, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Challenge, User } from '@/types/fitness';

type CategoryId = Challenge['category'];

const CATEGORY_CONFIG: Array<{
  id: CategoryId;
  label: string;
  Icon: typeof Dumbbell;
}> = [
  { id: 'strength', label: 'Strength', Icon: Dumbbell },
  { id: 'cardio', label: 'Cardio', Icon: HeartPulse },
  { id: 'nutrition', label: 'Nutrition', Icon: Apple },
  { id: 'custom', label: 'Custom', Icon: Sparkles },
];

function formatCount(value: number): string {
  return value.toString().padStart(2, '0');
}

interface HudSidebarProps {
  operator: User | null;
  challenges: Challenge[];
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  selectedChallengeId: string | null;
  onSelectChallenge: (challengeId: string) => void;
  onLogout?: () => void;
}

export function HudSidebar({
  operator,
  challenges,
  selectedCategory,
  onSelectCategory,
  selectedChallengeId,
  onSelectChallenge,
  onLogout,
}: HudSidebarProps) {
  const challengesForCategory = useMemo(() => {
    return challenges.filter(challenge => challenge.category === selectedCategory);
  }, [challenges, selectedCategory]);

  const countsByCategory = useMemo(() => {
    return challenges.reduce<Record<CategoryId, number>>(
      (acc, challenge) => {
        acc[challenge.category] += 1;
        return acc;
      },
      { strength: 0, cardio: 0, nutrition: 0, custom: 0 }
    );
  }, [challenges]);

  const selectedCategoryConfig = CATEGORY_CONFIG.find(c => c.id === selectedCategory);
  const operatorName = operator?.display_name || 'OPERATOR';
  const operatorInitial = operatorName.trim().charAt(0).toUpperCase() || 'O';
  const operatorRole = (operator?.role || 'client').toUpperCase();

  return (
    <aside className="flex h-full">
      {/* Rail (icons only) */}
      <div className="w-16 bg-black/60 backdrop-blur-xl border-r border-emerald-500/10 flex flex-col items-center">
        <div className="pt-4 flex flex-col items-center gap-3">
          <div className="group relative">
            <button
              type="button"
              className="w-12 h-12 border border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center transition-colors hover:bg-emerald-500/10"
              aria-label="FitsiteGonga"
            >
              <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center transform -skew-x-12 border border-emerald-400/30">
                <Zap className="w-5 h-5 text-black" />
              </div>
            </button>
            <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-zinc-950 border border-white/10 px-3 py-2 text-[10px] font-mono tracking-[0.3em] text-slate-200 whitespace-nowrap">
                FITSITEGONGA
              </div>
            </div>
          </div>

          <div className="w-10 h-px bg-white/10" />

          {CATEGORY_CONFIG.map(({ id, label, Icon }) => {
            const isSelected = selectedCategory === id;
            const count = countsByCategory[id] || 0;
            return (
              <div key={id} className="group relative w-full flex justify-center">
                <div
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[2px] bg-emerald-500 transition-opacity',
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  )}
                />
                <button
                  type="button"
                  onClick={() => onSelectCategory(id)}
                  aria-current={isSelected ? 'page' : undefined}
                  className={cn(
                    'w-12 h-12 border flex items-center justify-center transition-all',
                    'bg-zinc-950/40 border-white/10 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/30 hover:bg-emerald-500/5',
                    isSelected && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </button>
                <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-zinc-950 border border-white/10 px-3 py-2 text-[10px] font-mono tracking-[0.25em] text-slate-200 whitespace-nowrap">
                    {label.toUpperCase()} [{formatCount(count)}]
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto pb-4 flex flex-col items-center gap-2">
          <div className="group relative">
            <button
              type="button"
              className="w-12 h-12 border border-white/10 bg-zinc-950/40 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-colors flex items-center justify-center"
              aria-label={`Operator ${operatorName}`}
            >
              <span className="font-mono text-xs tracking-[0.3em] text-slate-200">
                [{operatorInitial}]
              </span>
            </button>
            <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-zinc-950 border border-white/10 px-3 py-2 text-[10px] font-mono tracking-[0.25em] text-slate-200 whitespace-nowrap">
                OPERATOR: {operatorName.toUpperCase()} [{operatorRole}]
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-12 h-12 border border-white/10 bg-zinc-950/40 hover:bg-red-500/10 hover:border-red-500/30 transition-colors flex items-center justify-center text-slate-300 hover:text-red-300"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Panel (challenge list) */}
      <div className="w-[300px] bg-zinc-950/60 backdrop-blur-xl border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                // Sector
              </div>
              <div className="mt-2 text-sm font-black tracking-[0.35em] uppercase text-slate-200">
                {selectedCategoryConfig?.label || selectedCategory}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                Protocols
              </div>
              <div className="mt-2 font-mono text-sm text-emerald-300">
                {formatCount(challengesForCategory.length)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {challengesForCategory.length === 0 ? (
            <div className="px-4 py-6">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                // No protocols
              </div>
              <div className="mt-2 text-sm text-slate-200">
                No challenges in this sector yet.
              </div>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                Create one (trainer/admin) or switch sectors.
              </div>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              {challengesForCategory.map(challenge => {
                const isSelected = challenge.id === selectedChallengeId;
                return (
                  <button
                    key={challenge.id}
                    type="button"
                    onClick={() => onSelectChallenge(challenge.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 border transition-colors',
                      'border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5',
                      isSelected && 'border-emerald-500/40 bg-emerald-500/10'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-slate-500 tracking-[0.35em] uppercase">
                          PROTOCOL
                        </div>
                        <div className="mt-1 text-sm text-slate-200 truncate">
                          {challenge.name}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] font-mono text-slate-500 tracking-[0.35em] uppercase">
                          TARGET
                        </div>
                        <div className="mt-1 text-xs font-mono text-emerald-300">
                          {challenge.goal_value} {challenge.goal_unit}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
            // Status
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">OPERATOR</span>
            <span className="text-slate-200 truncate max-w-[180px]">{operatorName}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

