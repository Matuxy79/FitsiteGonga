import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  Minus,
  Trash2,
  Timer,
  Sparkles,
  Flame,
  Dumbbell,
  Zap,
  Target,
  Moon,
  History,
  TrendingUp,
} from "lucide-react";

/**
 * WorkoutWidget — standalone day-based workout logger.
 *
 * Solarized Light Theme variant.
 * Persists per-day workout logs via window.storage.
 */

// ---------- helpers ----------

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isToday(d: Date) {
  return dateKey(d) === dateKey(new Date());
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDayName(d: Date) {
  return DAY_NAMES[d.getDay()];
}

function formatFullDate(d: Date) {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const TEMPLATES = [
  {
    id: "push",
    name: "Push Day",
    icon: Flame,
    exercises: [
      { name: "Bench Press", targetSets: 4, targetReps: 8 },
      { name: "Overhead Press", targetSets: 3, targetReps: 10 },
      { name: "Incline DB Press", targetSets: 3, targetReps: 10 },
      { name: "Tricep Pushdown", targetSets: 3, targetReps: 12 },
      { name: "Lateral Raises", targetSets: 3, targetReps: 15 },
    ],
  },
  {
    id: "pull",
    name: "Pull Day",
    icon: Dumbbell,
    exercises: [
      { name: "Deadlift", targetSets: 4, targetReps: 6 },
      { name: "Pull-Ups", targetSets: 4, targetReps: 8 },
      { name: "Barbell Row", targetSets: 3, targetReps: 10 },
      { name: "Face Pulls", targetSets: 3, targetReps: 15 },
      { name: "Bicep Curls", targetSets: 3, targetReps: 12 },
    ],
  },
  {
    id: "legs",
    name: "Leg Day",
    icon: Zap,
    exercises: [
      { name: "Back Squat", targetSets: 4, targetReps: 8 },
      { name: "Romanian Deadlift", targetSets: 3, targetReps: 10 },
      { name: "Leg Press", targetSets: 3, targetReps: 12 },
      { name: "Leg Curls", targetSets: 3, targetReps: 12 },
      { name: "Calf Raises", targetSets: 4, targetReps: 15 },
    ],
  },
  {
    id: "fullbody",
    name: "Full Body",
    icon: Target,
    exercises: [
      { name: "Squats", targetSets: 3, targetReps: 10 },
      { name: "Push-Ups", targetSets: 3, targetReps: 15 },
      { name: "Bent-Over Row", targetSets: 3, targetReps: 10 },
      { name: "Overhead Press", targetSets: 3, targetReps: 10 },
      { name: "Romanian Deadlift", targetSets: 3, targetReps: 10 },
    ],
  },
  {
    id: "rest",
    name: "Rest Day",
    icon: Moon,
    isRestDay: true,
    exercises: [],
  },
];

// ---------- storage ----------

async function loadJSON(key: string, fallback: any) {
  try {
    const res = await (window as any).storage.get(key, false);
    if (res && res.value) return JSON.parse(res.value);
    return fallback;
  } catch (e) {
    return fallback;
  }
}

async function saveJSON(key: string, value: any) {
  try {
    await (window as any).storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("Storage save failed", e);
  }
}

async function deleteKey(key: string) {
  try {
    await (window as any).storage.delete(key, false);
  } catch (e) {
    // key may not exist yet — fine
  }
}

// ---------- history insights ----------

interface HistoryInsights {
  recentTemplates: { id: string; name: string; date: string; icon: any }[];
  recommendedTemplate: (typeof TEMPLATES)[number] | null;
  weeklyStats: { day: string; key: string; hasWorkout: boolean; isToday: boolean }[];
}

async function loadHistoryInsights(currentDate: Date): Promise<HistoryInsights> {
  const empty: HistoryInsights = { recentTemplates: [], recommendedTemplate: null, weeklyStats: [] };
  try {
    const res = await (window as any).storage.list("workout-", false);
    if (!res || !res.keys || res.keys.length === 0) return empty;

    const items: { key: string; date: Date; dateKey: string; data: any }[] = [];
    for (const key of res.keys.slice(0, 200)) {
      const data = await loadJSON(key, null);
      if (!data) continue;
      const dk = key.replace("workout-", "");
      const [y, m, d] = dk.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      items.push({ key, date, dateKey: dk, data });
    }

    items.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Recent templates: last 3 unique non-rest workouts
    const seen = new Set<string>();
    const recentTemplates: { id: string; name: string; date: string; icon: any }[] = [];
    for (const item of items) {
      if (item.data.isRestDay) continue;
      const name = item.data.templateName || "Custom Workout";
      if (seen.has(name)) continue;
      seen.add(name);
      const template = TEMPLATES.find((t) => t.name === name);
      recentTemplates.push({
        id: item.key,
        name,
        date: dateKey(item.date),
        icon: template ? template.icon : Dumbbell,
      });
      if (recentTemplates.length >= 3) break;
    }

    // Recommendation: most common template on this day of week, then overall
    const dayOfWeek = currentDate.getDay();
    const sameDayItems = items.filter((i) => i.date.getDay() === dayOfWeek && !i.data.isRestDay);
    const dayCounts = new Map<string, number>();
    for (const item of sameDayItems) {
      const name = item.data.templateName || "Custom Workout";
      dayCounts.set(name, (dayCounts.get(name) || 0) + 1);
    }
    let recommendedName: string | null = null;
    let bestCount = 0;
    Array.from(dayCounts.entries()).forEach(([name, count]) => {
      if (count > bestCount) {
        bestCount = count;
        recommendedName = name;
      }
    });
    if (!recommendedName) {
      const overallCounts = new Map<string, number>();
      for (const item of items) {
        if (item.data.isRestDay) continue;
        const name = item.data.templateName || "Custom Workout";
        overallCounts.set(name, (overallCounts.get(name) || 0) + 1);
      }
      Array.from(overallCounts.entries()).forEach(([name, count]) => {
        if (count > bestCount && name !== "Custom Workout") {
          bestCount = count;
          recommendedName = name;
        }
      });
    }
    const recommendedTemplate = recommendedName
      ? TEMPLATES.find((t) => t.name === recommendedName) || null
      : null;

    // Weekly stats: Sun–Sat of the current week
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weeklyStats = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dk = dateKey(d);
      return {
        day: DAY_NAMES[d.getDay()][0],
        key: dk,
        hasWorkout: items.some((it) => it.dateKey === dk && !it.data.isRestDay),
        isToday: isToday(d),
      };
    });

    return { recentTemplates, recommendedTemplate, weeklyStats };
  } catch (e) {
    return empty;
  }
}

// ---------- small components ----------

interface TemplateGridProps {
  templates: typeof TEMPLATES;
  onSelect: (template: any) => void;
}

function TemplateGrid({ templates, onSelect }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {templates.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="flex flex-col items-start gap-2 p-3 rounded-xl border border-sol-base1/30 bg-sol-base2/40 hover:border-[#ff5d4f]/30 hover:bg-[#ff5d4f]/5 text-left transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-sol-base2 border border-sol-base1/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#ff5d4f]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-sol-base03">{t.name}</div>
              <div className="text-[10px] text-sol-base01 font-mono">
                {t.isRestDay ? "RECOVERY" : `${t.exercises.length} EXERCISES`}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface EmptyStateProps {
  templates: typeof TEMPLATES;
  onSelectTemplate: (template: any) => void;
  onCustom: () => void;
  insights: HistoryInsights;
  currentDate: Date;
}

function EmptyState({ templates, onSelectTemplate, onCustom, insights, currentDate }: EmptyStateProps) {
  const { recommendedTemplate, recentTemplates, weeklyStats } = insights;

  return (
    <div>
      {/* 1. Weekly context bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        {weeklyStats.map((s) => (
          <div key={s.key} className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-mono text-sol-base01 uppercase">{s.day}</span>
            <div
              className={
                "w-2 h-2 rounded-full border " +
                (s.hasWorkout
                  ? "bg-[#ff5d4f] border-[#ff5d4f]"
                  : "bg-sol-base2 border-sol-base1/30") +
                (s.isToday ? " ring-2 ring-[#ff5d4f]/30" : "")
              }
              title={s.hasWorkout ? "Workout logged" : "No workout"}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center text-center py-6 mb-4 bg-sol-base2/40 rounded-xl border border-sol-base1/20">
        <div className="w-12 h-12 rounded-full bg-sol-base2/80 flex items-center justify-center mb-3 border border-sol-base1/20">
          <Calendar className="w-5 h-5 text-sol-base01" />
        </div>
        <div className="text-sm font-bold text-sol-base03">No workout scheduled</div>
        <div className="text-[10px] text-sol-base01 mt-1.5 font-mono uppercase tracking-[0.4em]">Pick a template to start</div>
      </div>

      {/* 2. Smart recommendation card */}
      {recommendedTemplate && (
        <div className="mb-3 bg-gradient-to-r from-[#ff5d4f]/10 to-sol-base2/40 rounded-xl border border-[#ff5d4f]/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#ff5d4f]" />
              <span className="text-[10px] font-mono text-sol-base01 uppercase tracking-wider">Recommended for {formatDayName(currentDate)}</span>
            </div>
            {(() => {
              const RecommendedIcon = recommendedTemplate.icon;
              return <RecommendedIcon className="w-4 h-4 text-[#ff5d4f]" />;
            })()}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold text-sol-base03">{recommendedTemplate.name}</div>
            <button
              onClick={() => onSelectTemplate(recommendedTemplate)}
              className="px-3 py-1.5 rounded-lg bg-[#ff5d4f] text-white text-[10px] font-bold hover:bg-[#e54d3f] transition-colors font-mono uppercase tracking-wider"
            >
              Start
            </button>
          </div>
        </div>
      )}

      <TemplateGrid templates={templates} onSelect={onSelectTemplate} />

      {/* 3. Recent templates quick-restart */}
      {recentTemplates.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <History className="w-3 h-3 text-sol-base01" />
            <span className="text-[10px] font-mono text-sol-base01 uppercase tracking-wider">Recent</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentTemplates.map((rt) => {
              const Icon = rt.icon;
              const knownTemplate = templates.find((t) => t.name === rt.name);
              return (
                <button
                  key={rt.id}
                  onClick={() => (knownTemplate ? onSelectTemplate(knownTemplate) : onCustom())}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-sol-base1/30 bg-sol-base2/40 hover:border-[#ff5d4f]/30 hover:bg-[#ff5d4f]/5 text-left shrink-0 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-[#ff5d4f]" />
                  <span className="text-xs font-semibold text-sol-base03 whitespace-nowrap">{rt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={onCustom}
        className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-sol-base1/30 hover:border-[#ff5d4f]/30 text-sm font-semibold text-sol-base01 hover:text-[#ff5d4f] flex items-center justify-center gap-1.5 transition-colors font-mono"
      >
        <Plus className="w-4 h-4" /> START FREESTYLE
      </button>
    </div>
  );
}

interface RestDayViewProps {
  templates: typeof TEMPLATES;
  onSelectTemplate: (template: any) => void;
}

function RestDayView({ templates, onSelectTemplate }: RestDayViewProps) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div>
      <div className="flex flex-col items-center text-center py-6 mb-4 bg-sol-base2/40 rounded-xl border border-sol-base1/20">
        <div className="w-12 h-12 rounded-full bg-sol-base2/80 flex items-center justify-center mb-3 border border-sol-base1/20">
          <Moon className="w-5 h-5 text-sol-base01" />
        </div>
        <div className="text-sm font-bold text-sol-base03">Rest Day</div>
        <div className="text-[10px] text-sol-base01 mt-1.5 font-mono uppercase tracking-[0.4em]">Recovery is part of the program</div>
      </div>
      {!showPicker ? (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full py-2.5 rounded-xl border border-sol-base1/30 text-sm font-semibold text-sol-base01 hover:border-[#ff5d4f]/30 hover:text-[#ff5d4f] hover:bg-[#ff5d4f]/5 transition-colors font-mono"
        >
          LOG A WORKOUT INSTEAD
        </button>
      ) : (
        <TemplateGrid templates={templates.filter((t) => !t.isRestDay)} onSelect={onSelectTemplate} />
      )}
    </div>
  );
}

interface ExerciseCardProps {
  exercise: any;
  onRemove: () => void;
  onAddSet: () => void;
  onRemoveSet: (idx: number) => void;
  onUpdateSet: (idx: number, field: string, value: any) => void;
  onToggleSet: (idx: number) => void;
}

function ExerciseCard({ exercise, onRemove, onAddSet, onRemoveSet, onUpdateSet, onToggleSet }: ExerciseCardProps) {
  return (
    <div className="bg-sol-base2/30 rounded-xl p-4 mb-3 border border-sol-base1/20 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-sol-base02">{exercise.name}</div>
        <button
          aria-label={`Remove ${exercise.name}`}
          onClick={onRemove}
          className="w-6 h-6 flex items-center justify-center rounded-full text-sol-base1 hover:text-sol-red hover:bg-sol-red/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-sol-base01 font-mono tracking-wider mb-2 px-1">
        <span className="w-6 text-center">SET</span>
        <span className="w-10 text-center">TARGET</span>
        <span className="w-16 text-center">KG</span>
        <span className="w-14 text-center">REPS</span>
        <span className="w-8"></span>
        <span className="w-5"></span>
      </div>

      {exercise.sets.map((set: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 py-1">
          <span className="w-6 text-xs text-sol-base01 text-center font-mono">{idx + 1}</span>
          <span className="w-10 text-xs text-sol-base00 text-center font-mono">{exercise.targetReps}</span>
          <input
            type="number"
            inputMode="decimal"
            value={set.weight}
            onChange={(e) => onUpdateSet(idx, "weight", e.target.value)}
            placeholder="0"
            className="w-16 h-8 text-sm text-center rounded-lg border border-sol-base1/40 bg-white text-sol-base03 focus:border-[#ff5d4f]/50 focus:outline-none focus:ring-1 focus:ring-[#ff5d4f]/30"
          />
          <input
            type="number"
            inputMode="numeric"
            value={set.reps}
            onChange={(e) => onUpdateSet(idx, "reps", e.target.value)}
            placeholder="0"
            className="w-14 h-8 text-sm text-center rounded-lg border border-sol-base1/40 bg-white text-sol-base03 focus:border-[#ff5d4f]/50 focus:outline-none focus:ring-1 focus:ring-[#ff5d4f]/30"
          />
          <button
            aria-label={set.done ? "Mark set incomplete" : "Mark set complete"}
            onClick={() => onToggleSet(idx)}
            className={
              "w-8 h-8 rounded-full flex items-center justify-center border transition-all " +
              (set.done 
                ? "bg-[#ff5d4f] border-[#ff5d4f] text-white shadow-[0_0_10px_rgba(255,93,79,0.3)]" 
                : "bg-white border-sol-base1/40 text-sol-base1 hover:border-[#ff5d4f]/30 hover:text-[#ff5d4f]")
            }
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            aria-label="Remove set"
            onClick={() => onRemoveSet(idx)}
            className="w-5 h-5 flex items-center justify-center text-sol-base1 hover:text-sol-red transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      ))}

      <button onClick={onAddSet} className="text-xs font-semibold text-[#ff5d4f] hover:text-[#e54d3f] flex items-center gap-1 mt-2.5 px-1 font-mono">
        <Plus className="w-3 h-3" /> ADD SET
      </button>
    </div>
  );
}

interface RestTimerBarProps {
  restTimer: any;
  onAdjust: (delta: number) => void;
  onDismiss: () => void;
}

function RestTimerBar({ restTimer, onAdjust, onDismiss }: RestTimerBarProps) {
  const mm = Math.floor(restTimer.secondsLeft / 60);
  const ss = pad(restTimer.secondsLeft % 60);
  return (
    <div className="mt-4 bg-white border border-sol-base1/30 rounded-xl px-4 py-3 flex items-center gap-3 shadow-discord">
      <Timer className="w-4 h-4 text-[#ff5d4f] animate-pulse" />
      <div className="flex-1">
        <div className="text-[10px] uppercase font-mono tracking-wider text-sol-base01">Rest Timer</div>
        <div className="text-lg font-bold text-sol-base03 font-mono">
          {mm}:{ss}
        </div>
      </div>
      <button onClick={() => onAdjust(-15)} className="text-xs px-2 py-1.5 rounded-md bg-sol-base2 hover:bg-sol-base1/30 text-sol-base03 border border-sol-base1/20 font-mono">
        -15s
      </button>
      <button onClick={() => onAdjust(15)} className="text-xs px-2 py-1.5 rounded-md bg-sol-base2 hover:bg-sol-base1/30 text-sol-base03 border border-sol-base1/20 font-mono">
        +15s
      </button>
      <button
        aria-label="Dismiss rest timer"
        onClick={onDismiss}
        className="w-7 h-7 flex items-center justify-center rounded-full text-sol-base1 hover:bg-sol-base2 hover:text-sol-base03 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-5 rounded-2xl z-20"
      style={{ backgroundColor: "rgba(0, 43, 54, 0.4)" }}
    >
      <div className="bg-white border border-sol-base1/30 rounded-xl p-5 w-full shadow-discord-xl">
        <div className="text-sm font-bold text-sol-base03 mb-1">{title}</div>
        <div className="text-xs text-sol-base01 mb-4">{message}</div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-sol-base1/30 text-sm font-semibold text-sol-base01 hover:bg-sol-base2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-sol-red text-white text-sm font-semibold hover:bg-sol-red/90 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- main component ----------

interface WorkoutWidgetProps {
  initialDate?: Date | string | null;
}

export default function WorkoutWidget({ initialDate }: WorkoutWidgetProps = {}) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (initialDate) {
      const d = typeof initialDate === "string" ? new Date(initialDate + "T00:00:00") : new Date(initialDate);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  });

  useEffect(() => {
    if (initialDate) {
      const d = typeof initialDate === "string" ? new Date(initialDate + "T00:00:00") : new Date(initialDate);
      if (!isNaN(d.getTime())) {
        setCurrentDate(d);
      }
    }
  }, [initialDate]);

  const [workoutData, setWorkoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggedDates, setLoggedDates] = useState(new Set<string>());
  const [historyInsights, setHistoryInsights] = useState<HistoryInsights>({
    recentTemplates: [],
    recommendedTemplate: null,
    weeklyStats: [],
  });
  const [restTimer, setRestTimer] = useState<any>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<any>(null);

  const skipNextSave = useRef(true);
  const dateKeyRef = useRef(dateKey(currentDate));

  // load list of days that already have logged data, once
  useEffect(() => {
    (async () => {
      try {
        const res = await (window as any).storage.list("workout-", false);
        if (res && res.keys) {
          setLoggedDates(new Set(res.keys.map((k: string) => k.replace("workout-", ""))));
        }
      } catch (e) {
        // no data yet — fine
      }
    })();
  }, []);

  // load history-derived insights whenever the day changes
  useEffect(() => {
    loadHistoryInsights(currentDate).then(setHistoryInsights).catch(() => {});
  }, [currentDate]);

  // load workout for the current day whenever the day changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const key = dateKey(currentDate);
    dateKeyRef.current = key;
    (async () => {
      const data = await loadJSON(`workout-${key}`, null);
      if (!cancelled) {
        skipNextSave.current = true;
        setWorkoutData(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentDate]);

  // persist whenever workoutData changes (but not right after a load)
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const key = `workout-${dateKeyRef.current}`;
    if (workoutData) {
      saveJSON(key, workoutData);
      setLoggedDates((prev) => (prev.has(dateKeyRef.current) ? prev : new Set(prev).add(dateKeyRef.current)));
    } else {
      deleteKey(key);
      setLoggedDates((prev) => {
        if (!prev.has(dateKeyRef.current)) return prev;
        const next = new Set(prev);
        next.delete(dateKeyRef.current);
        return next;
      });
    }
  }, [workoutData]);

  // auto-complete when every set is checked
  useEffect(() => {
    if (!workoutData || workoutData.isRestDay || workoutData.completedAt) return;
    const total = workoutData.exercises.reduce((n: number, e: any) => n + e.sets.length, 0);
    const done = workoutData.exercises.reduce((n: number, e: any) => n + e.sets.filter((s: any) => s.done).length, 0);
    if (total > 0 && done === total) {
      setWorkoutData((w: any) => ({ ...w, completedAt: Date.now() }));
    }
  }, [workoutData]);

  // rest timer countdown
  useEffect(() => {
    if (!restTimer) return;
    if (restTimer.secondsLeft <= 0) {
      setRestTimer(null);
      return;
    }
    const id = setTimeout(() => {
      setRestTimer((t: any) => (t ? { ...t, secondsLeft: t.secondsLeft - 1 } : null));
    }, 1000);
    return () => clearTimeout(id);
  }, [restTimer]);

  function goPrevDay() {
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() - 1);
      return nd;
    });
  }

  // Set the correct reference key on manual navigate
  useEffect(() => {
    dateKeyRef.current = dateKey(currentDate);
  }, [currentDate]);

  function goNextDay() {
    setCurrentDate((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);
      return nd;
    });
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // Apply templates using the correct types
  function applyTemplate(template: any) {
    if (template.isRestDay) {
      setWorkoutData({ templateName: template.name, isRestDay: true, exercises: [], completedAt: null });
    } else {
      setWorkoutData({
        templateName: template.name,
        isRestDay: false,
        completedAt: null,
        exercises: template.exercises.map((ex: any) => ({
          id: genId(),
          name: ex.name,
          targetReps: ex.targetReps,
          sets: Array.from({ length: ex.targetSets }, () => ({ weight: "", reps: ex.targetReps, done: false })),
        })),
      });
    }
    setShowTemplatePicker(false);
    setShowTemplateConfirm(false);
    setPendingTemplate(null);
  }

  // Handle template switch confirmation
  function handleSelectTemplate(template: any) {
    const hasProgress =
      workoutData && !workoutData.isRestDay && workoutData.exercises.some((e: any) => e.sets.some((s: any) => s.done));
    if (hasProgress) {
      setPendingTemplate(template);
      setShowTemplateConfirm(true);
    } else {
      applyTemplate(template);
    }
  }

  function startCustomWorkout() {
    setWorkoutData({ templateName: "Custom Workout", isRestDay: false, completedAt: null, exercises: [] });
    setShowAddExercise(true);
  }

  function updateExercise(id: string, updater: (e: any) => any) {
    setWorkoutData((w: any) => ({ ...w, exercises: w.exercises.map((e: any) => (e.id === id ? updater(e) : e)) }));
  }

  function removeExercise(id: string) {
    setWorkoutData((w: any) => ({ ...w, exercises: w.exercises.filter((e: any) => e.id !== id) }));
  }

  function addSet(exerciseId: string) {
    updateExercise(exerciseId, (e: any) => ({
      ...e,
      sets: [...e.sets, { weight: "", reps: e.targetReps, done: false }],
    }));
  }

  function removeSet(exerciseId: string, idx: number) {
    updateExercise(exerciseId, (e: any) => ({ ...e, sets: e.sets.filter((_: any, i: number) => i !== idx) }));
  }

  function updateSetField(exerciseId: string, idx: number, field: string, value: any) {
    updateExercise(exerciseId, (e: any) => ({
      ...e,
      sets: e.sets.map((s: any, i: number) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  }

  // Toggle set status and start rest timer
  function toggleSetDone(exerciseId: string, idx: number) {
    const ex = workoutData.exercises.find((e: any) => e.id === exerciseId);
    const nowDone = !ex.sets[idx].done;
    setWorkoutData((w: any) => ({
      ...w,
      exercises: w.exercises.map((e: any) =>
        e.id !== exerciseId ? e : { ...e, sets: e.sets.map((s: any, i: number) => (i === idx ? { ...s, done: nowDone } : s)) }
      ),
    }));
    if (nowDone) {
      setRestTimer({ secondsLeft: 90, running: true });
    }
  }

  function handleAddExercise() {
    const name = newExerciseName.trim();
    if (!name) return;
    setWorkoutData((w: any) => {
      const base =
        w && !w.isRestDay ? w : { templateName: (w && w.templateName) || "Custom Workout", isRestDay: false, completedAt: null, exercises: [] };
      return {
        ...base,
        exercises: [
          ...base.exercises,
          {
            id: genId(),
            name,
            targetReps: 10,
            sets: [
              { weight: "", reps: 10, done: false },
              { weight: "", reps: 10, done: false },
              { weight: "", reps: 10, done: false },
            ],
          },
        ],
      };
    });
    setNewExerciseName("");
    setShowAddExercise(false);
  }

  function finishWorkout() {
    setWorkoutData((w: any) => ({ ...w, completedAt: Date.now() }));
  }

  function reopenWorkout() {
    setWorkoutData((w: any) => ({ ...w, completedAt: null }));
  }

  function handleClearWorkout() {
    setShowClearConfirm(true);
  }

  function confirmClearWorkout() {
    setWorkoutData(null);
    setShowClearConfirm(false);
  }

  function adjustRest(delta: number) {
    setRestTimer((t: any) => (t ? { ...t, secondsLeft: Math.max(0, t.secondsLeft + delta) } : t));
  }

  function dismissRest() {
    setRestTimer(null);
  }

  const totalSets =
    workoutData && !workoutData.isRestDay ? workoutData.exercises.reduce((n: number, e: any) => n + e.sets.length, 0) : 0;
  const doneSets =
    workoutData && !workoutData.isRestDay
      ? workoutData.exercises.reduce((n: number, e: any) => n + e.sets.filter((s: any) => s.done).length, 0)
      : 0;
  const progressPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  return (
    <div className="w-full bg-sol-base3 flex justify-center text-sol-base03 font-sans h-full overflow-y-auto">
      <div className="w-full">
        <div className="bg-white border border-sol-base1/30 p-4 sm:p-5 relative overflow-hidden shadow-discord h-full flex flex-col">
          


          {/* day navigator */}
          <div className="flex items-center justify-between mb-2">
            <button
              aria-label="Previous day"
              onClick={goPrevDay}
              className="w-8 h-8 flex items-center justify-center rounded-full text-sol-base01 hover:bg-sol-base2 hover:text-sol-base03 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <div className="text-base font-bold text-sol-base03 flex items-center justify-center gap-1.5 tracking-wide uppercase">
                {formatDayName(currentDate)}
                {loggedDates.has(dateKey(currentDate)) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5d4f] inline-block shadow-[0_0_8px_rgba(255,93,79,0.8)]" title="Workout logged" />
                )}
              </div>
              <div className="text-[10px] font-mono text-sol-base01 mt-0.5">{formatFullDate(currentDate)}</div>
            </div>
            <button
              aria-label="Next day"
              onClick={goNextDay}
              className="w-8 h-8 flex items-center justify-center rounded-full text-sol-base01 hover:bg-sol-base2 hover:text-sol-base03 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mb-5 border-b border-sol-base1/20 pb-3">
            {!isToday(currentDate) && (
              <button onClick={goToday} className="text-[10px] font-bold text-[#ff5d4f] hover:text-[#e54d3f] transition-colors font-mono tracking-wider">
                [JUMP TO TODAY]
              </button>
            )}
            {workoutData && (
              <button
                aria-label="Clear workout"
                onClick={handleClearWorkout}
                className="text-[10px] font-bold text-sol-base1 hover:text-sol-red flex items-center gap-1 transition-colors font-mono tracking-wider"
              >
                <Trash2 className="w-3 h-3" /> [CLEAR PROTOCOL]
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center text-sol-base01 text-xs font-mono uppercase tracking-wider">
              [Loading system frequencies…]
            </div>
          ) : !workoutData ? (
            <EmptyState
              templates={TEMPLATES}
              onSelectTemplate={handleSelectTemplate}
              onCustom={startCustomWorkout}
              insights={historyInsights}
              currentDate={currentDate}
            />
          ) : workoutData.isRestDay ? (
            <RestDayView templates={TEMPLATES} onSelectTemplate={handleSelectTemplate} />
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div>
                  <div className="text-sm font-bold text-sol-base03 tracking-wide uppercase">{workoutData.templateName}</div>
                  <div className="text-[10px] text-sol-base01 font-mono mt-0.5">
                    {doneSets}/{totalSets} SETS · {workoutData.exercises.length} EXERCISES
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplatePicker((s) => !s)}
                  className="text-xs font-semibold text-[#ff5d4f] hover:text-[#e54d3f] transition-colors font-mono"
                >
                  [CHANGE]
                </button>
              </div>

              <div className="w-full h-1 bg-sol-base2 rounded-full mb-5 overflow-hidden border border-sol-base1/20 shrink-0">
                <div
                  className="h-full bg-[#ff5d4f] rounded-full transition-all shadow-[0_0_10px_rgba(255,93,79,0.3)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {showTemplatePicker && (
                <div className="mb-4 bg-sol-base2/30 p-3 rounded-xl border border-sol-base1/20 shrink-0">
                  <div className="text-[9px] font-mono text-sol-base01 uppercase tracking-widest mb-2">{/* SELECT FREQUENCY */}</div>
                  <TemplateGrid templates={TEMPLATES} onSelect={handleSelectTemplate} />
                </div>
              )}

              {workoutData.completedAt && (
                <div className="flex items-center justify-between bg-sol-green/10 border border-sol-green/30 rounded-xl px-4 py-3 mb-4 shadow-sm shrink-0">
                  <div className="flex items-center gap-2 text-sol-green text-xs font-bold tracking-wider font-mono">
                    <Sparkles className="w-4 h-4 text-sol-green" /> [PROTOCOL_SUCCESSFUL]
                  </div>
                  <button onClick={reopenWorkout} className="text-xs font-semibold text-sol-green hover:text-sol-green/80 font-mono">
                    [REOPEN]
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto pr-1 mb-3">
                {workoutData.exercises.map((ex: any) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    onRemove={() => removeExercise(ex.id)}
                    onAddSet={() => addSet(ex.id)}
                    onRemoveSet={(idx) => removeSet(ex.id, idx)}
                    onUpdateSet={(idx, field, value) => updateSetField(ex.id, idx, field, value)}
                    onToggleSet={(idx) => toggleSetDone(ex.id, idx)}
                  />
                ))}
              </div>

              <div className="shrink-0 pt-2 border-t border-sol-base1/20">
                {!showAddExercise ? (
                  <button
                    onClick={() => setShowAddExercise(true)}
                    className="w-full py-2 rounded-xl border border-dashed border-sol-base1/30 hover:border-[#ff5d4f]/30 text-xs font-semibold text-sol-base01 hover:text-[#ff5d4f] flex items-center justify-center gap-1.5 mb-3 transition-colors font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD NEW EXERCISE
                  </button>
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      autoFocus
                      type="text"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddExercise();
                        if (e.key === "Escape") {
                          setShowAddExercise(false);
                          setNewExerciseName("");
                        }
                      }}
                      placeholder="Exercise name..."
                      className="flex-1 h-9 px-3 text-sm rounded-lg border border-sol-base1/40 bg-white text-sol-base03 focus:border-[#ff5d4f]/50 focus:outline-none"
                    />
                    <button
                      onClick={handleAddExercise}
                      className="h-9 px-4 rounded-lg bg-[#ff5d4f] text-white text-xs font-bold hover:bg-[#e54d3f] transition-colors uppercase font-mono"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddExercise(false);
                        setNewExerciseName("");
                      }}
                      className="h-9 w-9 flex items-center justify-center rounded-lg text-sol-base01 hover:text-sol-base03 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {!workoutData.completedAt && workoutData.exercises.length > 0 && (
                  <button
                    onClick={finishWorkout}
                    className="w-full py-2.5 rounded-xl bg-[#ff5d4f] text-white text-xs font-bold hover:bg-[#e54d3f] shadow-[0_4px_10px_rgba(255,93,79,0.2)] transition-all uppercase tracking-wider font-mono"
                  >
                    COMMIT WORKOUT
                  </button>
                )}
              </div>
            </div>
          )}

          {restTimer && <RestTimerBar restTimer={restTimer} onAdjust={adjustRest} onDismiss={dismissRest} />}

          {showClearConfirm && (
            <ConfirmModal
              title="Clear this workout?"
              message="This removes all logged sets for this day. This can't be undone."
              confirmLabel="Clear"
              onCancel={() => setShowClearConfirm(false)}
              onConfirm={confirmClearWorkout}
            />
          )}

          {showTemplateConfirm && pendingTemplate && (
            <ConfirmModal
              title={`Switch to ${pendingTemplate.name}?`}
              message="You've already logged progress today. Switching templates will replace it."
              confirmLabel="Switch"
              onCancel={() => {
                setShowTemplateConfirm(false);
                setPendingTemplate(null);
              }}
              onConfirm={() => applyTemplate(pendingTemplate)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
