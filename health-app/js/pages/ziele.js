// Ziele: zentrale Seite für alle Zielwerte – alle Tracker lesen von hier.

import { store, fmtNum } from '../store.js';
import { h, icon, toast, input } from '../ui.js';
import { refresh } from '../app.js';
import { activeStreaks } from '../goals.js';

const FIELDS = [
  { section: 'Ernährung', items: [
    { key: 'kcal', label: 'Kalorien pro Tag', unit: 'kcal', icon: 'flame', color: 'var(--c-kcal)', step: 50 },
    { key: 'protein', label: 'Protein', unit: 'g', icon: 'flame', color: 'var(--c-train)', step: 5 },
    { key: 'carbs', label: 'Kohlenhydrate', unit: 'g', icon: 'flame', color: 'var(--c-mood)', step: 5 },
    { key: 'fat', label: 'Fett', unit: 'g', icon: 'flame', color: 'var(--c-kcal)', step: 5 },
    { key: 'waterMl', label: 'Wasser', unit: 'ml', icon: 'drop', color: 'var(--c-water)', step: 250 },
  ]},
  { section: 'Aktivität', items: [
    { key: 'steps', label: 'Schritte pro Tag', unit: '', icon: 'steps', color: 'var(--c-steps)', step: 500 },
    { key: 'workoutsPerWeek', label: 'Trainings pro Woche', unit: '', icon: 'dumbbell', color: 'var(--c-train)', step: 1 },
  ]},
  { section: 'Körper & Schlaf', items: [
    { key: 'weightTargetKg', label: 'Zielgewicht', unit: 'kg', icon: 'scale', color: 'var(--c-weight)', step: 0.5, decimal: true, optional: true },
    { key: 'sleepMin', label: 'Schlaf pro Nacht', unit: 'Min.', icon: 'moon', color: 'var(--c-sleep)', step: 15 },
  ]},
];

export default {
  title: 'Ziele',
  render(el) {
    const g = store.get().goals;
    const streaks = activeStreaks();

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Ziele'),
          h('div', { class: 'sub' }, 'Deine Messlatte – überall in der App aktiv'),
        ),
      ),
    );

    if (streaks.length) {
      el.append(h('div', { class: 'streak-row', style: 'margin-bottom:14px' },
        streaks.map(st => h('span', { class: 'streak-pill', style: `--mc:${st.color}` },
          icon('flame', 16), `${st.days} ${st.days === 1 ? 'Tag' : 'Tage'} ${st.label}`)),
      ));
    }

    FIELDS.forEach(sec => {
      el.append(h('div', { class: 'section-title' }, h('h2', {}, sec.section)));
      el.append(h('div', { class: 'list' }, sec.items.map(f => {
        const val = g[f.key];
        const inp = input({
          type: 'number', inputmode: f.decimal ? 'decimal' : 'numeric', step: f.step,
          value: val ?? '', placeholder: f.optional ? 'optional' : '',
          style: 'max-width:110px;text-align:right;padding:9px 12px',
          onchange: e => save(f, e.target.value),
        });
        return h('div', { class: 'row' },
          h('div', { class: 'module-ic', style: `--mc:${f.color}` }, icon(f.icon, 20)),
          h('div', { class: 'grow' },
            h('div', { class: 'title' }, f.label),
            h('div', { class: 'sub' }, f.unit || ' '),
          ),
          inp,
        );
      })));
    });

    el.append(h('div', { class: 'notice', style: 'margin-top:6px' }, icon('target', 18),
      h('span', {}, 'Änderungen gelten sofort für Dashboard, Tracker, Streaks und den Wochen-Report.')));

    function save(f, raw) {
      const v = parseFloat(String(raw).replace(',', '.'));
      store.update(st => {
        st.goals[f.key] = Number.isFinite(v) && v > 0 ? v : (f.optional ? null : st.goals[f.key]);
      });
      toast('Ziel gespeichert');
      refresh();
    }
  },
};
