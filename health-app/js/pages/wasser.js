// Wasser-Tracker: animierte Füllstands-Visualisierung, Schnell-Buttons,
// Tagesziel und 7-Tage-Verlauf.

import { store, todayKey, lastDays, waterOf, fmtNum, fmtDate } from '../store.js';
import { h, icon, barChart, toast } from '../ui.js';
import { refresh, go } from '../app.js';
import { streak } from '../goals.js';

export default {
  title: 'Wasser',
  render(el) {
    const s = store.get();
    const today = todayKey();
    const ml = waterOf(today);
    const goal = s.goals.waterMl;
    const pct = Math.min(100, (ml / goal) * 100);
    const days = lastDays(7);
    const st = streak('water');

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Wasser'),
          h('div', { class: 'sub' }, `Ziel: ${fmtNum(goal)} ml pro Tag`),
        ),
        st > 0 ? h('span', { class: 'badge tint', style: '--badge-c:var(--c-water)' }, icon('flame', 14), `${st} Tage`) : null,
      ),

      h('div', { class: 'card', style: 'text-align:center' },
        h('div', { class: 'water-viz' },
          h('div', { class: 'water-fill', style: `height:${pct}%` }),
        ),
        h('div', { class: 'stat-big', style: 'margin-top:14px' }, fmtNum(ml), h('small', {}, ` / ${fmtNum(goal)} ml`)),
        h('div', { class: 'small muted', style: 'margin-top:2px' },
          ml >= goal ? 'Tagesziel erreicht – stark!' : `Noch ${fmtNum(goal - ml)} ml bis zum Ziel`),
        h('div', { class: 'chip-row', style: 'justify-content:center;margin-top:16px' },
          ...s.settings.glasses.map(g => h('button', { class: 'chip', onclick: () => add(g) }, icon('drop', 15), `+${g} ml`)),
          h('button', { class: 'chip', 'aria-label': 'Wasser reduzieren', onclick: () => add(-250) }, icon('minus', 15), '250 ml'),
        ),
      ),

      h('div', { class: 'section-title' },
        h('h2', {}, 'Letzte 7 Tage'),
        h('button', { class: 'link small', onclick: () => go('ziele') }, 'Ziel ändern'),
      ),
      h('div', { class: 'card' },
        barChart({
          data: days.map(k => ({ label: fmtDate(k, 'wd'), value: waterOf(k), showValue: false })),
          goal, color: 'var(--c-water)',
          formatValue: v => fmtNum(Math.round(v / 100) / 10, 1),
        }),
        h('div', { class: 'small muted', style: 'margin-top:8px;text-align:center' }, 'Gestrichelte Linie = Tagesziel'),
      ),

      h('div', { class: 'notice' }, icon('drop', 18),
        h('span', {}, 'Tipp: Die Glas-Größen der Schnell-Buttons kannst du in den Einstellungen anpassen.')),
    );

    function add(amount) {
      store.update(st => {
        if (!st.days[today]) st.days[today] = {};
        st.days[today].waterMl = Math.max(0, (st.days[today].waterMl || 0) + amount);
      });
      if (amount > 0) toast(`+${amount} ml`);
      refresh();
    }
  },
};
