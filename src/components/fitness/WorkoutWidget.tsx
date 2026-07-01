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
} from "lucide-react";

/**
 * WorkoutWidget — standalone day-based workout logger.
 *
 * Drop-in component. Persists per-day workout logs via window.storage
 * (personal, non-shared). Swap loadJSON/saveJSON/deleteKey for real API
 * calls to wire it to a backend — the rest of the component doesn't care
 * where the data comes from.
 */

// ---------- helpers ----------

function pad(n) {
  return String(n).padStart(2, "0");
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isToday(d) {
  return dateKey(d) === dateKey(new Date());
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDayName(d) {
  return DAY_NAMES[d.getDay()];
}

function formatFullDate(d) {
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

// ---------- storage (swap these for real API calls if wiring to a backend) ----------

async function loadJSON(key, fallback) {
  try {
    const res = await window.storage.get(key, false);
    if (res && res.value) return JSON.parse(res.value);
    return fallback;
  } catch (e) {
    return fallback;
  }
}

async function saveJSON(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("Storage save failed", e);
  }
}

async function deleteKey(key) {
  try {
    await window.storage.delete(key, false);
  } catch (e) {
    // key may not exist yet — fine
  }
}

// ---------- small components ----------

function TemplateGrid({ templates, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {templates.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="flex flex-col items-start gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-red-200 hover:bg-red-50 text-left transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100">
              <Icon className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{t.name}</div>
              <div className="text-xs text-gray-400">
                {t.isRestDay ? "Recovery" : `${t.exercises.length} exercises`}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ templates, onSelectTemplate, onCustom }) {
  return (
    <div>
      <div className="flex flex-col items-center text-center py-6 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <Calendar className="w-5 h-5 text-gray-300" />
        </div>
        <div className="text-sm font-semibold text-gray-900">No workout scheduled</div>
        <div className="text-xs text-gray-400 mt-1">Pick a template to get started</div>
      </div>
      <TemplateGrid templates={templates} onSelect={onSelectTemplate} />
      <button
        onClick={onCustom}
        className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" /> Start custom workout
      </button>
    </div>
  );
}

function RestDayView({ templates, onSelectTemplate }) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <div>
      <div className="flex flex-col items-center text-center py-6 mb-2">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <Moon className="w-5 h-5 text-gray-300" />
        </div>
        <div className="text-sm font-semibold text-gray-900">Rest Day</div>
        <div className="text-xs text-gray-400 mt-1">Recovery is part of the program. Back at it tomorrow.</div>
      </div>
      {!showPicker ? (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full py-2.5 rounded-xl border border-gray-100 text-sm font-medium text-gray-400 hover:border-red-300 hover:text-red-600"
        >
          Log a workout instead
        </button>
      ) : (
        <TemplateGrid templates={templates.filter((t) => !t.isRestDay)} onSelect={onSelectTemplate} />
      )}
    </div>
  );
}

function ExerciseCard({ exercise, onRemove, onAddSet, onRemoveSet, onUpdateSet, onToggleSet }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-900">{exercise.name}</div>
        <button
          aria-label={`Remove ${exercise.name}`}
          onClick={onRemove}
          className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-red-600 hover:bg-red-50"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1 px-1">
        <span className="w-6 text-center">SET</span>
        <span className="w-10 text-center">TARGET</span>
        <span className="w-16 text-center">KG</span>
        <span className="w-14 text-center">REPS</span>
        <span className="w-8"></span>
        <span className="w-5"></span>
      </div>

      {exercise.sets.map((set, idx) => (
        <div key={idx} className="flex items-center gap-2 py-1">
          <span className="w-6 text-xs text-gray-400 text-center">{idx + 1}</span>
          <span className="w-10 text-xs text-gray-300 text-center">{exercise.targetReps}</span>
          <input
            type="number"
            inputMode="decimal"
            value={set.weight}
            onChange={(e) => onUpdateSet(idx, "weight", e.target.value)}
            placeholder="0"
            className="w-16 h-8 text-sm text-center rounded-lg border border-gray-200 focus:border-red-500 focus:outline-none bg-white"
          />
          <input
            type="number"
            inputMode="numeric"
            value={set.reps}
            onChange={(e) => onUpdateSet(idx, "reps", e.target.value)}
            placeholder="0"
            className="w-14 h-8 text-sm text-center rounded-lg border border-gray-200 focus:border-red-500 focus:outline-none bg-white"
          />
          <button
            aria-label={set.done ? "Mark set incomplete" : "Mark set complete"}
            onClick={() => onToggleSet(idx)}
            className={
              "w-8 h-8 rounded-full flex items-center justify-center border " +
              (set.done ? "bg-red-600 border-red-600 text-white" : "bg-white border-gray-200 text-gray-200")
            }
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            aria-label="Remove set"
            onClick={() => onRemoveSet(idx)}
            className="w-5 h-5 flex items-center justify-center text-gray-200 hover:text-red-500"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      ))}

      <button onClick={onAddSet} className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1.5 px-1">
        <Plus className="w-3 h-3" /> Add set
      </button>
    </div>
  );
}

function RestTimerBar({ restTimer, onAdjust, onDismiss }) {
  const mm = Math.floor(restTimer.secondsLeft / 60);
  const ss = pad(restTimer.secondsLeft % 60);
  return (
    <div className="mt-4 bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-3">
      <Timer className="w-4 h-4 text-red-400" />
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-gray-400">Rest</div>
        <div className="text-lg font-semibold text-white">
          {mm}:{ss}
        </div>
      </div>
      <button onClick={() => onAdjust(-15)} className="text-xs px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white">
        -15
      </button>
      <button onClick={() => onAdjust(15)} className="text-xs px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white">
        +15
      </button>
      <button
        aria-label="Dismiss rest timer"
        onClick={onDismiss}
        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-5 rounded-2xl"
      style={{ backgroundColor: "rgba(17, 24, 39, 0.55)" }}
    >
      <div className="bg-white rounded-xl p-4 w-full shadow-lg">
        <div className="text-sm font-semibold text-gray-900 mb-1">{title}</div>
        <div className="text-xs text-gray-500 mb-4">{message}</div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- main component ----------

export default function WorkoutWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedDates, setLoggedDates] = useState(new Set());
  const [restTimer, setRestTimer] = useState(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null);

  const skipNextSave = useRef(true);
  const dateKeyRef = useRef(dateKey(new Date()));

  // load list of days that already have logged data, once
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.list("workout-", false);
        if (res && res.keys) {
          setLoggedDates(new Set(res.keys.map((k) => k.replace("workout-", ""))));
        }
      } catch (e) {
        // no data yet — fine
      }
    })();
  }, []);

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
    const total = workoutData.exercises.reduce((n, e) => n + e.sets.length, 0);
    const done = workoutData.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
    if (total > 0 && done === total) {
      setWorkoutData((w) => ({ ...w, completedAt: Date.now() }));
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
      setRestTimer((t) => (t ? { ...t, secondsLeft: t.secondsLeft - 1 } : null));
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

  function applyTemplate(template) {
    if (template.isRestDay) {
      setWorkoutData({ templateName: template.name, isRestDay: true, exercises: [], completedAt: null });
    } else {
      setWorkoutData({
        templateName: template.name,
        isRestDay: false,
        completedAt: null,
        exercises: template.exercises.map((ex) => ({
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

  function handleSelectTemplate(template) {
    const hasProgress =
      workoutData && !workoutData.isRestDay && workoutData.exercises.some((e) => e.sets.some((s) => s.done));
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

  function updateExercise(id, updater) {
    setWorkoutData((w) => ({ ...w, exercises: w.exercises.map((e) => (e.id === id ? updater(e) : e)) }));
  }

  function removeExercise(id) {
    setWorkoutData((w) => ({ ...w, exercises: w.exercises.filter((e) => e.id !== id) }));
  }

  function addSet(exerciseId) {
    updateExercise(exerciseId, (e) => ({
      ...e,
      sets: [...e.sets, { weight: "", reps: e.targetReps, done: false }],
    }));
  }

  function removeSet(exerciseId, idx) {
    updateExercise(exerciseId, (e) => ({ ...e, sets: e.sets.filter((_, i) => i !== idx) }));
  }

  function updateSetField(exerciseId, idx, field, value) {
    updateExercise(exerciseId, (e) => ({
      ...e,
      sets: e.sets.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  }

  function toggleSetDone(exerciseId, idx) {
    const ex = workoutData.exercises.find((e) => e.id === exerciseId);
    const nowDone = !ex.sets[idx].done;
    setWorkoutData((w) => ({
      ...w,
      exercises: w.exercises.map((e) =>
        e.id !== exerciseId ? e : { ...e, sets: e.sets.map((s, i) => (i === idx ? { ...s, done: nowDone } : s)) }
      ),
    }));
    if (nowDone) {
      setRestTimer({ secondsLeft: 90, running: true });
    }
  }

  function handleAddExercise() {
    const name = newExerciseName.trim();
    if (!name) return;
    setWorkoutData((w) => {
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
    setWorkoutData((w) => ({ ...w, completedAt: Date.now() }));
  }

  function reopenWorkout() {
    setWorkoutData((w) => ({ ...w, completedAt: null }));
  }

  function handleClearWorkout() {
    setShowClearConfirm(true);
  }

  function confirmClearWorkout() {
    setWorkoutData(null);
    setShowClearConfirm(false);
  }

  function adjustRest(delta) {
    setRestTimer((t) => (t ? { ...t, secondsLeft: Math.max(0, t.secondsLeft + delta) } : t));
  }

  function dismissRest() {
    setRestTimer(null);
  }

  const totalSets =
    workoutData && !workoutData.isRestDay ? workoutData.exercises.reduce((n, e) => n + e.sets.length, 0) : 0;
  const doneSets =
    workoutData && !workoutData.isRestDay
      ? workoutData.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0)
      : 0;
  const progressPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 relative overflow-hidden">
          {/* day navigator */}
          <div className="flex items-center justify-between mb-1">
            <button
              aria-label="Previous day"
              onClick={goPrevDay}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1.5">
                {formatDayName(currentDate)}
                {loggedDates.has(dateKey(currentDate)) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" title="Workout logged" />
                )}
              </div>
              <div className="text-xs text-gray-400">{formatFullDate(currentDate)}</div>
            </div>
            <button
              aria-label="Next day"
              onClick={goNextDay}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mb-5">
            {!isToday(currentDate) && (
              <button onClick={goToday} className="text-xs font-medium text-red-600 hover:text-red-700">
                Jump to today
              </button>
            )}
            {workoutData && (
              <button
                aria-label="Clear workout"
                onClick={handleClearWorkout}
                className="text-xs font-medium text-gray-300 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center text-gray-300 text-sm">Loading…</div>
          ) : !workoutData ? (
            <EmptyState templates={TEMPLATES} onSelectTemplate={handleSelectTemplate} onCustom={startCustomWorkout} />
          ) : workoutData.isRestDay ? (
            <RestDayView templates={TEMPLATES} onSelectTemplate={handleSelectTemplate} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{workoutData.templateName}</div>
                  <div className="text-xs text-gray-400">
                    {doneSets}/{totalSets} sets · {workoutData.exercises.length} exercises
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplatePicker((s) => !s)}
                  className="text-xs font-medium text-gray-400 hover:text-red-600"
                >
                  Change
                </button>
              </div>

              <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {showTemplatePicker && (
                <div className="mb-4">
                  <TemplateGrid templates={TEMPLATES} onSelect={handleSelectTemplate} />
                </div>
              )}

              {workoutData.completedAt && (
                <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                    <Sparkles className="w-4 h-4" /> Workout complete
                  </div>
                  <button onClick={reopenWorkout} className="text-xs font-medium text-green-600 hover:text-green-800">
                    Edit
                  </button>
                </div>
              )}

              {workoutData.exercises.map((ex) => (
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

              {!showAddExercise ? (
                <button
                  onClick={() => setShowAddExercise(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5 mb-3"
                >
                  <Plus className="w-4 h-4" /> Add exercise
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
                    placeholder="Exercise name"
                    className="flex-1 h-9 px-3 text-sm rounded-lg border border-gray-200 focus:border-red-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddExercise}
                    className="h-9 px-3 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddExercise(false);
                      setNewExerciseName("");
                    }}
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!workoutData.completedAt && workoutData.exercises.length > 0 && (
                <button
                  onClick={finishWorkout}
                  className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
                >
                  Finish workout
                </button>
              )}
            </>
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
