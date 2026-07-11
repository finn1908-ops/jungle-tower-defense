// Zentrale Ziel-Logik: Wurde ein Ziel an einem Tag erreicht?
// Daraus werden die Streaks (Tages-Serien) berechnet.

import { store, kcalOf, waterOf, stepsOf, workoutsOf, todayKey, addDays } from './store.js';

export const GOAL_DEFS = [
  { id: 'kcal',   label: 'Kalorien', icon: 'flame',    color: 'var(--c-kcal)' },
  { id: 'water',  label: 'Wasser',   icon: 'drop',     color: 'var(--c-water)' },
  { id: 'steps',  label: 'Schritte', icon: 'steps',    color: 'var(--c-steps)' },
  { id: 'train',  label: 'Training', icon: 'dumbbell', color: 'var(--c-train)' },
  { id: 'supps',  label: 'Supps',    icon: 'pill',     color: 'var(--c-supp)' },
];

// Ziel an einem Tag erreicht? (null = keine Daten/nicht bewertbar)
export function goalMet(goalId, dateKey) {
  const g = store.get().goals;
  switch (goalId) {
    case 'kcal': {
      const k = kcalOf(dateKey).kcal;
      if (k === 0) return null;
      return k <= g.kcal; // Tagesbudget eingehalten
    }
    case 'water': return waterOf(dateKey) > 0 ? waterOf(dateKey) >= g.waterMl : null;
    case 'steps': return stepsOf(dateKey) > 0 ? stepsOf(dateKey) >= g.steps : null;
    case 'train': return workoutsOf(dateKey).length > 0 ? true : null;
    case 'supps': {
      const s = store.get();
      if (!s.supplements.length) return null;
      const taken = s.days[dateKey]?.supps || {};
      const total = s.supplements.reduce((a, sup) => a + (sup.times?.length || 1), 0);
      const done = s.supplements.reduce((a, sup) =>
        a + (sup.times || ['morgens']).filter(t => taken[sup.id]?.[t]).length, 0);
      if (done === 0) return null;
      return done >= total;
    }
    default: return null;
  }
}

// Aktuelle Serie: Wie viele Tage in Folge (bis heute bzw. gestern) erreicht?
// Ein "null"-Tag (keine Daten) bricht die Serie, heute darf aber noch offen sein.
export function streak(goalId) {
  let n = 0;
  let key = todayKey();
  const todayMet = goalMet(goalId, key);
  if (todayMet === true) { n++; }
  else if (todayMet === false && goalId !== 'train') { /* heute schon verfehlt -> Serie zählt bis gestern */ }
  key = addDays(key, -1);
  for (let i = 0; i < 365; i++) {
    if (goalMet(goalId, key) === true) { n++; key = addDays(key, -1); }
    else break;
  }
  return n;
}

// Für das Dashboard: alle Streaks > 0, sortiert absteigend
export function activeStreaks() {
  return GOAL_DEFS
    .map(def => ({ ...def, days: streak(def.id) }))
    .filter(x => x.days > 0)
    .sort((a, b) => b.days - a.days);
}

// Wochenwerte für den Report
export function weekSummary(startKey) {
  const keys = Array.from({ length: 7 }, (_, i) => addDays(startKey, i));
  const s = store.get();
  const g = s.goals;

  const kcals = keys.map(k => kcalOf(k).kcal);
  const kcalDays = kcals.filter(v => v > 0);
  const steps = keys.map(k => stepsOf(k));
  const stepDays = steps.filter(v => v > 0);
  const water = keys.map(k => waterOf(k));
  const waterDays = water.filter(v => v > 0);
  const sleepMins = keys.map(k => s.days[k]?.sleep?.minutes || 0).filter(v => v > 0);

  const workouts = s.workouts.filter(w => keys.includes(w.date));
  const volume = workouts.reduce((a, w) =>
    a + (w.items || []).reduce((b, it) =>
      b + it.sets.reduce((c, set) => c + (set.done ? (set.reps || 0) * (set.kg || 0) : 0), 0), 0), 0);

  const weights = s.weights.filter(w => keys.includes(w.date)).sort((a, b) => a.date.localeCompare(b.date));

  // Ziel-Erreichung: bewertbare Tage vs. erreichte Tage über alle Ziel-Typen
  let evaluated = 0, met = 0;
  for (const k of keys) {
    if (k > todayKey()) continue;
    for (const def of GOAL_DEFS) {
      const r = goalMet(def.id, k);
      if (r !== null) { evaluated++; if (r) met++; }
    }
  }

  return {
    keys,
    kcalAvg: kcalDays.length ? Math.round(kcalDays.reduce((a, b) => a + b, 0) / kcalDays.length) : 0,
    kcalGoal: g.kcal,
    steps, stepsTotal: steps.reduce((a, b) => a + b, 0),
    stepsAvg: stepDays.length ? Math.round(stepDays.reduce((a, b) => a + b, 0) / stepDays.length) : 0,
    waterAvg: waterDays.length ? Math.round(waterDays.reduce((a, b) => a + b, 0) / waterDays.length) : 0,
    sleepAvg: sleepMins.length ? Math.round(sleepMins.reduce((a, b) => a + b, 0) / sleepMins.length) : 0,
    workoutCount: workouts.length, workoutGoal: g.workoutsPerWeek, volume,
    weightStart: weights[0]?.kg ?? null, weightEnd: weights[weights.length - 1]?.kg ?? null,
    goalRate: evaluated ? Math.round((met / evaluated) * 100) : null,
  };
}
