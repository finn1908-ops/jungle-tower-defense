// Wochen-Report: automatische Auswertung pro Kalenderwoche mit
// Blätter-Funktion – Gewichtstrend, Kalorien, Training, Schritte, Schlaf.

import { store, todayKey, addDays, weekStart, fmtDate, fmtNum, stepsOf } from '../store.js';
import { h, icon, barChart, progressBar } from '../ui.js';
import { refresh } from '../app.js';
import { weekSummary } from '../goals.js';

let offset = 0; // 0 = aktuelle Woche, -1 = letzte Woche …

export default {
  title: 'Wochen-Report',
  render(el) {
    const start = addDays(weekStart(), offset * 7);
    const end = addDays(start, 6);
    const sum = weekSummary(start);
    const isCurrent = offset === 0;

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Report'),
          h('div', { class: 'sub' }, 'Deine Woche in Zahlen'),
        ),
      ),
      h('div', { class: 'card pad-s card-row', style: 'justify-content:space-between' },
        h('button', { class: 'icon-btn', 'aria-label': 'Vorige Woche', onclick: () => { offset--; refresh(); } }, icon('chevL', 18)),
        h('div', { style: 'text-align:center' },
          h('b', {}, isCurrent ? 'Diese Woche' : offset === -1 ? 'Letzte Woche' : `KW ${isoWeek(start)}`),
          h('div', { class: 'small muted' }, `${fmtDate(start)} – ${fmtDate(end)}`),
        ),
        h('button', { class: 'icon-btn', 'aria-label': 'Nächste Woche', disabled: isCurrent, onclick: () => { offset++; refresh(); } }, icon('chevR', 18)),
      ),
    );

    // Ziel-Erreichung
    if (sum.goalRate !== null) {
      el.append(h('div', { class: 'hero-card card' },
        h('div', { class: 'eyebrow' }, 'Ziel-Erreichung'),
        h('div', { style: 'font-size:34px;font-weight:800;margin:2px 0' }, `${sum.goalRate} %`),
        h('div', { style: 'opacity:.85;font-size:13.5px' }, 'aller bewertbaren Tagesziele erreicht'),
      ));
    }

    // Kacheln
    el.append(h('div', { class: 'dash-grid' },
      tile('flame', 'var(--c-kcal)', 'Ø Kalorien', sum.kcalAvg ? `${fmtNum(sum.kcalAvg)}` : '–',
        sum.kcalAvg ? (sum.kcalAvg <= sum.kcalGoal ? `${fmtNum(sum.kcalGoal - sum.kcalAvg)} unter Budget` : `${fmtNum(sum.kcalAvg - sum.kcalGoal)} über Budget`) : 'keine Einträge'),
      tile('steps', 'var(--c-steps)', 'Schritte gesamt', fmtNum(sum.stepsTotal), sum.stepsAvg ? `Ø ${fmtNum(sum.stepsAvg)} / Tag` : 'keine Einträge'),
      tile('dumbbell', 'var(--c-train)', 'Trainings', `${sum.workoutCount} / ${sum.workoutGoal}`,
        sum.volume ? `${fmtNum(sum.volume)} kg Volumen` : 'Wochenziel'),
      tile('drop', 'var(--c-water)', 'Ø Wasser', sum.waterAvg ? `${fmtNum(sum.waterAvg)} ml` : '–', 'pro erfasstem Tag'),
      tile('moon', 'var(--c-sleep)', 'Ø Schlaf', sum.sleepAvg ? `${Math.floor(sum.sleepAvg / 60)}:${String(sum.sleepAvg % 60).padStart(2, '0')} h` : '–', 'pro erfasster Nacht'),
      tile('scale', 'var(--c-weight)', 'Gewicht',
        sum.weightEnd != null ? `${fmtNum(sum.weightEnd, 1)} kg` : '–',
        sum.weightStart != null && sum.weightEnd != null && sum.weightStart !== sum.weightEnd
          ? `${sum.weightEnd - sum.weightStart > 0 ? '+' : ''}${fmtNum(sum.weightEnd - sum.weightStart, 1)} kg zur Vorwoche`
          : 'in dieser Woche'),
    ));

    // Schritte-Chart der Woche
    el.append(
      h('div', { class: 'section-title' }, h('h2', {}, 'Schritte')),
      h('div', { class: 'card' },
        barChart({
          data: sum.keys.map(k => ({ label: fmtDate(k, 'wd'), value: stepsOf(k), active: k <= todayKey() })),
          goal: store.get().goals.steps, color: 'var(--c-steps)',
        }),
      ),
      h('div', { class: 'section-title' }, h('h2', {}, 'Trainingswoche')),
      h('div', { class: 'card pad-s' },
        h('div', { style: 'display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px' },
          h('span', { class: 'muted', style: 'font-weight:600' }, `${sum.workoutCount} von ${sum.workoutGoal} Einheiten`),
          h('span', { class: 'num', style: 'font-weight:700' }, `${Math.min(100, Math.round((sum.workoutCount / Math.max(1, sum.workoutGoal)) * 100))} %`),
        ),
        progressBar(sum.workoutCount, sum.workoutGoal, 'var(--c-train)'),
      ),
    );
  },
};

function tile(ic, color, label, value, sub) {
  return h('div', { class: 'card pad-s' },
    h('div', { class: 'card-row', style: 'margin-bottom:6px' },
      h('div', { class: 'module-ic', style: `--mc:${color};width:32px;height:32px;border-radius:10px` }, icon(ic, 17)),
      h('span', { class: 'eyebrow' }, label),
    ),
    h('div', { class: 'stat-big', style: 'font-size:21px' }, value),
    h('div', { class: 'small muted' }, sub),
  );
}

function isoWeek(key) {
  const d = new Date(key + 'T12:00:00');
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const fDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - fDay + 3);
  return 1 + Math.round((d - firstThursday) / (7 * 24 * 3600 * 1000));
}
