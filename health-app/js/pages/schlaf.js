// Schlaf-Tracker: Zubettgeh-/Aufwachzeit, automatische Dauer,
// Schlafziel und Wochen-Chart.

import { store, todayKey, addDays, lastDays, fmtDate, relDay } from '../store.js';
import { h, icon, barChart, toast, input, field } from '../ui.js';
import { refresh, go } from '../app.js';

function minutesBetween(bed, wake) {
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60; // über Mitternacht
  return mins;
}

const fmtH = mins => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')} h`;

export default {
  title: 'Schlaf',
  render(el) {
    const s = store.get();
    const today = todayKey();
    const rec = s.days[today]?.sleep;
    const goal = s.goals.sleepMin;

    const bedIn = input({ type: 'time', value: rec?.bed || '23:00' });
    const wakeIn = input({ type: 'time', value: rec?.wake || '07:00' });

    const days = lastDays(7);
    const data = days.map(k => ({ label: fmtDate(k, 'wd'), value: (s.days[k]?.sleep?.minutes || 0) / 60 }));
    const vals = days.map(k => s.days[k]?.sleep?.minutes || 0).filter(v => v > 0);
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Schlaf'),
          h('div', { class: 'sub' }, `Ziel: ${fmtH(goal)} pro Nacht`),
        ),
      ),

      h('div', { class: 'card' },
        h('div', { class: 'eyebrow', style: 'margin-bottom:10px' }, 'Letzte Nacht'),
        rec
          ? h('div', { class: 'card-row', style: 'margin-bottom:12px' },
              h('div', { class: 'module-ic', style: '--mc:var(--c-sleep)' }, icon('moon', 20)),
              h('div', { class: 'grow' },
                h('div', { class: 'stat-big' }, fmtH(rec.minutes)),
                h('div', { class: 'small muted' }, `${rec.bed} – ${rec.wake} Uhr · ${rec.minutes >= goal ? 'Ziel erreicht' : `${fmtH(goal - rec.minutes)} unter dem Ziel`}`),
              ))
          : h('p', { class: 'small muted', style: 'margin-bottom:12px' }, 'Noch nicht eingetragen – wann hast du geschlafen?'),
        h('div', { class: 'input-grid' },
          field('Zu Bett', bedIn),
          field('Aufgewacht', wakeIn),
        ),
        h('button', { class: 'btn btn-primary btn-block', onclick: () => {
          const bed = bedIn.value, wake = wakeIn.value;
          if (!bed || !wake) return toast('Beide Zeiten angeben', 'warn');
          store.update(st => {
            if (!st.days[today]) st.days[today] = {};
            st.days[today].sleep = { bed, wake, minutes: minutesBetween(bed, wake) };
          });
          toast('Schlaf gespeichert'); refresh();
        } }, 'Speichern'),
      ),

      h('div', { class: 'section-title' },
        h('h2', {}, 'Letzte 7 Nächte'),
        h('button', { class: 'link small', onclick: () => go('ziele') }, 'Ziel ändern'),
      ),
      h('div', { class: 'card' },
        barChart({ data, goal: goal / 60, color: 'var(--c-sleep)', formatValue: v => v.toFixed(1) }),
        h('div', { class: 'card-row', style: 'justify-content:space-around;margin-top:10px' },
          h('div', { style: 'text-align:center' },
            h('div', { class: 'num', style: 'font-weight:800;font-size:17px' }, avg ? fmtH(avg) : '–'),
            h('div', { class: 'small muted' }, 'Ø Schlafdauer')),
          h('div', { style: 'text-align:center' },
            h('div', { class: 'num', style: 'font-weight:800;font-size:17px' }, String(vals.filter(v => v >= goal).length)),
            h('div', { class: 'small muted' }, 'Nächte im Ziel')),
        ),
      ),

      // Nachtrag für gestern
      s.days[addDays(today, -1)]?.sleep ? null : h('div', { class: 'notice' }, icon('moon', 18),
        h('span', {}, 'Gestern vergessen? ',
          h('button', { class: 'link', onclick: () => {
            const bed = bedIn.value, wake = wakeIn.value;
            if (!bed || !wake) return toast('Zeiten oben eintragen', 'warn');
            store.update(st => {
              const k = addDays(today, -1);
              if (!st.days[k]) st.days[k] = {};
              st.days[k].sleep = { bed, wake, minutes: minutesBetween(bed, wake) };
            });
            toast(`Für ${relDay(addDays(today, -1)).toLowerCase()} gespeichert`); refresh();
          } }, 'Zeiten oben für gestern speichern'))),
    );
  },
};
