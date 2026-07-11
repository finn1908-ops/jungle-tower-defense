// "Mehr": Übersicht aller Bereiche als Grid – jede Funktion hat ihre Seite.

import { h, icon } from '../ui.js';
import { go } from '../app.js';

const GROUPS = [
  { label: 'Gesundheit', tiles: [
    ['kalorien', 'Kalorien', 'flame', 'var(--c-kcal)'],
    ['wasser', 'Wasser', 'drop', 'var(--c-water)'],
    ['schritte', 'Schritte', 'steps', 'var(--c-steps)'],
    ['gewicht', 'Gewicht', 'scale', 'var(--c-weight)'],
    ['training', 'Training', 'dumbbell', 'var(--c-train)'],
    ['schlaf', 'Schlaf', 'moon', 'var(--c-sleep)'],
    ['stimmung', 'Stimmung', 'smile', 'var(--c-mood)'],
    ['fasten', 'Fasten', 'timer', 'var(--c-fast)'],
    ['supplemente', 'Supplemente', 'pill', 'var(--c-supp)'],
  ]},
  { label: 'Alltag', tiles: [
    ['kalender', 'Kalender', 'calendar', 'var(--c-event)'],
    ['aufgaben', 'Aufgaben', 'checks', 'var(--c-task)'],
    ['erinnerungen', 'Erinnerungen', 'bell', 'var(--c-note)'],
    ['einkauf', 'Einkaufsliste', 'cart', 'var(--c-steps)'],
    ['notizen', 'Notizen', 'note', 'var(--c-note)'],
    ['wetter', 'Wetter', 'cloud', 'var(--c-water)'],
  ]},
  { label: 'Fortschritt', tiles: [
    ['ziele', 'Ziele', 'target', 'var(--accent)'],
    ['report', 'Wochen-Report', 'chart', 'var(--accent)'],
    ['einstellungen', 'Einstellungen', 'gear', 'var(--ink-2)'],
  ]},
];

export default {
  title: 'Mehr',
  render(el) {
    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Alle Bereiche'),
          h('div', { class: 'sub' }, 'Jede Funktion auf einer eigenen Seite'),
        ),
      ),
    );
    GROUPS.forEach(gr => {
      el.append(
        h('div', { class: 'section-title' }, h('h2', {}, gr.label)),
        h('div', { class: 'more-grid' }, gr.tiles.map(([route, label, ic, color]) =>
          h('button', { class: 'more-tile', onclick: () => go(route) },
            h('div', { class: 'module-ic', style: `--mc:${color}` }, icon(ic, 20)),
            label,
          ))),
      );
    });
  },
};
