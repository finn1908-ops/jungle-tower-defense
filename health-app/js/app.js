// App-Shell: Hash-Router, Tab-Bar, Theme-Anwendung, Quick-Add-FAB,
// Kurzbefehle-Import-Endpunkt (#/import) und Service-Worker-Registrierung.

import { store, todayKey, uid, fmtNum } from './store.js';
import { h, icon, sheet, toast, input, field } from './ui.js';

import dashboard from './pages/dashboard.js';
import kalorien from './pages/kalorien.js';
import gewicht from './pages/gewicht.js';
import schritte from './pages/schritte.js';
import wasser from './pages/wasser.js';
import supplemente from './pages/supplemente.js';
import training from './pages/training.js';
import schlaf from './pages/schlaf.js';
import stimmung from './pages/stimmung.js';
import fasten from './pages/fasten.js';
import wetter from './pages/wetter.js';
import kalender from './pages/kalender.js';
import notizen from './pages/notizen.js';
import aufgaben from './pages/aufgaben.js';
import erinnerungen from './pages/erinnerungen.js';
import einkauf from './pages/einkauf.js';
import ziele from './pages/ziele.js';
import report from './pages/report.js';
import einstellungen from './pages/einstellungen.js';
import mehr from './pages/mehr.js';

export const PAGES = {
  dashboard, kalorien, gewicht, schritte, wasser, supplemente, training,
  schlaf, stimmung, fasten, wetter, kalender, notizen, aufgaben,
  erinnerungen, einkauf, ziele, report, einstellungen, mehr,
};

const TABS = [
  { route: 'dashboard', label: 'Start', icon: 'home' },
  { route: 'kalorien', label: 'Ernährung', icon: 'flame' },
  { route: 'training', label: 'Training', icon: 'dumbbell' },
  { route: 'kalender', label: 'Planung', icon: 'calendar' },
  { route: 'mehr', label: 'Mehr', icon: 'grid' },
];

// ---------- Theme ----------

const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');

export function applyTheme() {
  const { theme, mode } = store.get().settings;
  const resolved = mode === 'auto' ? (mediaDark.matches ? 'dark' : 'light') : mode;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.mode = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    requestAnimationFrame(() => {
      meta.content = getComputedStyle(document.body).backgroundColor;
    });
  }
}
mediaDark.addEventListener('change', applyTheme);

// ---------- Router ----------

let currentRoute = null;

export function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '') || 'dashboard';
  const [pathPart, queryPart] = raw.split('?');
  const params = new URLSearchParams(queryPart || '');
  const [route, ...rest] = pathPart.split('/');
  return { route: route || 'dashboard', sub: rest.join('/'), params };
}

export const go = route => { location.hash = '#/' + route; };

function render() {
  const { route, sub, params } = parseHash();

  // Kurzbefehle-Import: #/import?steps=8500&date=2026-07-10
  if (route === 'import') {
    handleImport(params);
    return;
  }

  const page = PAGES[route] || PAGES.dashboard;
  currentRoute = route;

  const main = document.getElementById('page');
  main.innerHTML = '';
  main.scrollTop = 0;
  window.scrollTo(0, 0);
  page.render(main, { sub, params });

  // Tabs markieren
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.route === route
      || (t.dataset.route === 'mehr' && !TABS.some(x => x.route === route)));
  });
}

function handleImport(params) {
  const steps = parseInt(params.get('steps'), 10);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : todayKey();
  if (Number.isFinite(steps) && steps >= 0 && steps < 250000) {
    store.update(s => {
      if (!s.days[date]) s.days[date] = {};
      s.days[date].steps = steps;            // Tageswert überschreiben (idempotent)
      s.days[date].stepsSyncedAt = Date.now();
    });
    location.replace('#/schritte');
    setTimeout(() => toast(`${fmtNum(steps)} Schritte übernommen`), 350);
  } else {
    location.replace('#/schritte');
    setTimeout(() => toast('Import: keine gültige Schrittzahl', 'warn'), 350);
  }
}

// ---------- Tab-Bar ----------

function buildTabbar() {
  const bar = document.getElementById('tabbar');
  bar.innerHTML = '';
  TABS.forEach(t => {
    bar.append(h('button', {
      class: 'tab', dataset: { route: t.route },
      onclick: () => go(t.route),
      'aria-label': t.label,
    }, icon(t.icon, 23), h('span', {}, t.label)));
  });
}

// ---------- Quick-Add (FAB) ----------

function quickAdd() {
  const s = store.get();
  const today = todayKey();

  const waterBtns = h('div', { class: 'chip-row' },
    s.settings.glasses.map(ml => h('button', {
      class: 'chip',
      onclick: () => {
        store.update(st => {
          if (!st.days[today]) st.days[today] = {};
          st.days[today].waterMl = (st.days[today].waterMl || 0) + ml;
        });
        toast(`+${ml} ml Wasser`);
        sh.close();
      },
    }, icon('drop', 16), `${ml} ml`)),
  );

  const kcalIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'z. B. 450' });
  const kcalName = input({ type: 'text', placeholder: 'Was? (optional)' });
  const stepsIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'Schritte heute gesamt' });
  const weightIn = input({ type: 'number', inputmode: 'decimal', step: '0.1', placeholder: 'z. B. 82,4' });

  const sh = sheet('Schnell erfassen', h('div', {},
    h('div', { class: 'eyebrow', style: 'margin-bottom:8px' }, 'Wasser'),
    waterBtns,
    h('div', { class: 'divider' }),
    h('div', { class: 'eyebrow', style: 'margin-bottom:8px' }, 'Kalorien'),
    h('div', { class: 'input-grid' }, kcalName, kcalIn),
    h('button', {
      class: 'btn btn-ghost btn-block btn-s', style: 'margin:10px 0 0',
      onclick: () => {
        const kcal = parseFloat(kcalIn.value);
        if (!Number.isFinite(kcal) || kcal <= 0) return toast('Bitte Kalorien eingeben', 'warn');
        store.update(st => st.meals.push({
          id: uid(), date: today, slot: 'snack',
          name: kcalName.value.trim() || 'Schnelleintrag', kcal, p: 0, c: 0, f: 0,
        }));
        toast(`${fmtNum(kcal)} kcal eingetragen`);
        sh.close();
      },
    }, 'Kalorien eintragen'),
    h('div', { class: 'divider' }),
    h('div', { class: 'input-grid' },
      field('Schritte heute', stepsIn),
      field('Gewicht (kg)', weightIn),
    ),
    h('button', {
      class: 'btn btn-primary btn-block',
      onclick: () => {
        let didSomething = false;
        const steps = parseInt(stepsIn.value, 10);
        const kg = parseFloat(weightIn.value.replace(',', '.'));
        store.update(st => {
          if (Number.isFinite(steps) && steps >= 0) {
            if (!st.days[today]) st.days[today] = {};
            st.days[today].steps = steps; didSomething = true;
          }
          if (Number.isFinite(kg) && kg > 20 && kg < 400) {
            const existing = st.weights.find(w => w.date === today);
            if (existing) existing.kg = kg; else st.weights.push({ id: uid(), date: today, kg });
            didSomething = true;
          }
        });
        if (didSomething) { toast('Gespeichert'); sh.close(); refresh(); }
        else toast('Nichts zum Speichern', 'warn');
      },
    }, 'Speichern'),
  ));
}

// ---------- Re-Render bei Datenänderung ----------

let rerenderQueued = false;
export function refresh() {
  if (rerenderQueued) return;
  rerenderQueued = true;
  requestAnimationFrame(() => { rerenderQueued = false; render(); });
}

// ---------- Start ----------

applyTheme();
buildTabbar();
window.addEventListener('hashchange', render);
document.getElementById('fab').addEventListener('click', quickAdd);
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW-Registrierung fehlgeschlagen', err));
  });
}
