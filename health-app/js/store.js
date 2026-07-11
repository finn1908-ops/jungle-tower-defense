// Zentraler Datenspeicher: ein versioniertes JSON-Objekt in localStorage.
// Alle Seiten lesen/schreiben ausschließlich über diese API.

const KEY = 'pulse.data.v1';
const SCHEMA_VERSION = 1;

const DEFAULTS = () => ({
  version: SCHEMA_VERSION,
  settings: {
    theme: 'midnight',          // midnight | aurora | titanium
    mode: 'auto',               // auto | dark | light
    name: '',
    heightCm: null,
    glasses: [250, 500, 750],   // ml-Schnellwahl beim Wasser
    weather: { useGps: true, place: null }, // place: {name, lat, lon}
    people: ['Ich'],
  },
  goals: {
    kcal: 2200, protein: 130, carbs: 240, fat: 70,
    steps: 8000, waterMl: 2500,
    weightTargetKg: null,
    sleepMin: 480,
    workoutsPerWeek: 3,
  },
  // Tageswerte, key = 'YYYY-MM-DD'
  days: {},        // { steps, stepsSyncedAt, waterMl, mood:{score,tags,text}, sleep:{bed,wake,minutes}, supps:{id:{slot:true}} }
  meals: [],       // {id, date, slot, name, kcal, p, c, f}
  foods: [],       // {id, name, kcal, p, c, f, per:'100 g'|'Portion', fav, lastUsed}
  weights: [],     // {id, date, kg}
  supplements: [], // {id, name, dose, times:['morgens'|'mittags'|'abends']}
  exercises: [],   // {id, name, muscle, custom}
  templates: [],   // {id, name, kind, items:[{exerciseId, sets:[{reps, kg}]}]}
  workouts: [],    // {id, date, name, templateId, durationMin, items:[{exerciseId, sets:[{reps,kg,done}]}], cardio:{kind,min,km}, note}
  planned: [],     // {id, templateId, date:'YYYY-MM-DD'|null, weekdays:[0..6]|null, time}
  fasts: [],       // {id, start, end, targetH}
  activeFast: null,// {start, targetH}
  notes: [],       // {id, title, text, color, pinned, updatedAt}
  tasks: [],       // {id, title, due, priority, assignee, done, doneAt, createdAt}
  reminders: [],   // {id, title, date, time, repeat:'none'|'daily'|'weekly', lead}
  shopping: [],    // {id, name, category, done}
  events: [],      // {id, date, time, title, note}
  weatherCache: null,
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS();
    const data = JSON.parse(raw);
    return migrate({ ...DEFAULTS(), ...data, settings: { ...DEFAULTS().settings, ...data.settings }, goals: { ...DEFAULTS().goals, ...data.goals } });
  } catch (e) {
    console.error('Store konnte nicht geladen werden, starte leer.', e);
    return DEFAULTS();
  }
}

function migrate(data) {
  // Platz für künftige Schema-Migrationen (version < SCHEMA_VERSION)
  data.version = SCHEMA_VERSION;
  return data;
}

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.error('Speichern fehlgeschlagen', e); }
  }, 80);
}

export const store = {
  get: () => state,

  // patch: Funktion, die den State direkt mutiert – danach persist + notify
  update(fn) {
    fn(state);
    persist();
    listeners.forEach(l => l(state));
  },

  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  day(key = todayKey()) {
    if (!state.days[key]) state.days[key] = {};
    return state.days[key];
  },

  exportJson() {
    return JSON.stringify(state, null, 2);
  },

  importJson(text) {
    const data = JSON.parse(text); // wirft bei ungültigem JSON
    if (typeof data !== 'object' || data === null || !('version' in data)) {
      throw new Error('Keine gültige Pulse-Sicherung.');
    }
    state = migrate({ ...DEFAULTS(), ...data });
    persist();
    listeners.forEach(l => l(state));
  },

  wipe() {
    state = DEFAULTS();
    localStorage.removeItem(KEY);
    listeners.forEach(l => l(state));
  },
};

// ---------- IDs & Datum ----------

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = keyToDate(key);
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

// Letzte n Tage inkl. heute, aufsteigend
export function lastDays(n, end = todayKey()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i));
  return out;
}

// Montag der Woche, in der key liegt
export function weekStart(key = todayKey()) {
  const d = keyToDate(key);
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return todayKey(d);
}

export function weekKeys(startKey = weekStart()) {
  return Array.from({ length: 7 }, (_, i) => addDays(startKey, i));
}

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WD_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MON_LONG = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export function fmtDate(key, style = 'short') {
  const d = keyToDate(key);
  if (style === 'wd') return WD[d.getDay()];
  if (style === 'wdLong') return WD_LONG[d.getDay()];
  if (style === 'long') return `${WD_LONG[d.getDay()]}, ${d.getDate()}. ${MON_LONG[d.getMonth()]}`;
  if (style === 'monthYear') return `${MON_LONG[d.getMonth()]} ${d.getFullYear()}`;
  return `${d.getDate()}. ${MON[d.getMonth()]}`;
}

export function relDay(key) {
  const today = todayKey();
  if (key === today) return 'Heute';
  if (key === addDays(today, -1)) return 'Gestern';
  if (key === addDays(today, 1)) return 'Morgen';
  return fmtDate(key);
}

export const fmtNum = (n, digits = 0) =>
  Number(n ?? 0).toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// ---------- Abgeleitete Tageswerte ----------

export function mealsOf(dateKey) {
  return store.get().meals.filter(m => m.date === dateKey);
}

export function kcalOf(dateKey) {
  return mealsOf(dateKey).reduce(
    (a, m) => ({ kcal: a.kcal + (+m.kcal || 0), p: a.p + (+m.p || 0), c: a.c + (+m.c || 0), f: a.f + (+m.f || 0) }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
}

export function waterOf(dateKey) {
  return store.get().days[dateKey]?.waterMl || 0;
}

export function stepsOf(dateKey) {
  return store.get().days[dateKey]?.steps || 0;
}

export function latestWeight() {
  const w = [...store.get().weights].sort((a, b) => a.date.localeCompare(b.date));
  return w[w.length - 1] || null;
}

export function workoutsOf(dateKey) {
  return store.get().workouts.filter(w => w.date === dateKey);
}

// Geplantes Training für ein Datum (fester Termin oder Wochentags-Wiederholung)
export function plannedFor(dateKey) {
  const s = store.get();
  const wd = keyToDate(dateKey).getDay();
  return s.planned
    .filter(p => (p.date ? p.date === dateKey : (p.weekdays || []).includes(wd)))
    .map(p => ({ ...p, template: s.templates.find(t => t.id === p.templateId) }))
    .filter(p => p.template);
}

// Nächstes geplantes Training ab heute (bis zu 14 Tage voraus)
export function nextPlanned() {
  const today = todayKey();
  for (let i = 0; i < 14; i++) {
    const key = addDays(today, i);
    const list = plannedFor(key);
    if (list.length) return { date: key, plan: list[0], all: list };
  }
  return null;
}

// Erinnerungen, die an einem Tag fällig sind (inkl. Wiederholungen)
export function remindersFor(dateKey) {
  const wd = keyToDate(dateKey).getDay();
  return store.get().reminders.filter(r => {
    if (r.repeat === 'daily') return r.date <= dateKey;
    if (r.repeat === 'weekly') return r.date <= dateKey && keyToDate(r.date).getDay() === wd;
    return r.date === dateKey;
  });
}
