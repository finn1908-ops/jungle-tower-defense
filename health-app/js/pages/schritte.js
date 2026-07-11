// Schritte: automatischer Import per iOS-Kurzbefehle-Automation
// (#/import?steps=…) plus manuelle Eingabe als Fallback.

import { store, todayKey, lastDays, stepsOf, fmtNum, fmtDate } from '../store.js';
import { h, icon, ring, barChart, toast, input } from '../ui.js';
import { refresh, go } from '../app.js';
import { streak } from '../goals.js';

export default {
  title: 'Schritte',
  render(el) {
    const s = store.get();
    const today = todayKey();
    const steps = stepsOf(today);
    const goal = s.goals.steps;
    const syncedAt = s.days[today]?.stepsSyncedAt;
    const days = lastDays(7);
    const st = streak('steps');
    const appUrl = location.origin + location.pathname;

    const manualIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'Schritte heute gesamt', value: steps || '' });

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Schritte'),
          h('div', { class: 'sub' }, `Ziel: ${fmtNum(goal)} Schritte`),
        ),
        st > 0 ? h('span', { class: 'badge tint', style: '--badge-c:var(--c-steps)' }, icon('flame', 14), `${st} Tage`) : null,
      ),

      h('div', { class: 'card', style: 'text-align:center' },
        h('div', { style: 'display:grid;place-items:center' },
          ring({
            size: 150, stroke: 13, value: steps, max: goal, color: 'var(--c-steps)',
            label: fmtNum(steps), sub: `von ${fmtNum(goal)}`,
          }),
        ),
        h('div', { class: 'small muted', style: 'margin-top:10px' },
          syncedAt
            ? `Zuletzt synchronisiert: heute, ${new Date(syncedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`
            : 'Heute noch nicht synchronisiert'),
        h('div', { class: 'chip-row', style: 'justify-content:center;margin-top:12px' },
          [1000, 2500, 5000].map(n => h('button', { class: 'chip', onclick: () => setSteps(steps + n) }, `+${fmtNum(n)}`)),
        ),
      ),

      // Kurzbefehle-Anleitung
      h('details', { class: 'howto' },
        h('summary', {}, icon('sync', 19), 'Automatisch tracken mit Apple Health', h('span', { style: 'margin-left:auto' }, icon('chevD', 17))),
        h('div', { class: 'howto-body' },
          h('p', { style: 'margin-bottom:10px' }, 'Einmal einrichten (~5 Minuten), danach schickt dein iPhone die Schritte automatisch aus Apple Health an Pulse:'),
          h('ol', {},
            h('li', {}, 'Öffne die App „Kurzbefehle" → Tab „Kurzbefehle" → „+" für einen neuen Kurzbefehl.'),
            h('li', {}, 'Aktion hinzufügen: „Gesundheitsdaten suchen" – Typ „Schritte", Zeitraum „Heute". Aktiviere in den Aktionsoptionen „Gruppieren nach: Tag", damit ein Summenwert herauskommt.'),
            h('li', {}, 'Zweite Aktion: „URL" – trage ein: ', h('code', {}, `${appUrl}#/import?steps=[Gesundheitsdaten]`), ' (füge die Variable „Gesundheitsdaten" aus der ersten Aktion ein).'),
            h('li', {}, 'Dritte Aktion: „URL öffnen". Kurzbefehl z. B. „Schritte an Pulse" nennen.'),
            h('li', {}, 'Tab „Automation" → „+" → „Tageszeit" (z. B. 12:00, 18:00 und 22:00 Uhr) → „Sofort ausführen" aktivieren → deinen Kurzbefehl auswählen.'),
          ),
          h('p', { style: 'margin-top:10px' }, 'Beim Ausführen öffnet sich Pulse kurz und übernimmt den Tageswert – mehrfaches Synchronisieren überschreibt einfach den Stand.'),
        ),
      ),

      // Manuell
      h('div', { class: 'card' },
        h('div', { class: 'eyebrow', style: 'margin-bottom:10px' }, 'Manuell eintragen'),
        h('div', { class: 'card-row' },
          h('div', { class: 'grow' }, manualIn),
          h('button', { class: 'btn btn-primary', onclick: () => {
            const v = parseInt(manualIn.value, 10);
            if (!Number.isFinite(v) || v < 0) return toast('Bitte gültige Schrittzahl', 'warn');
            setSteps(v, false);
            toast('Schritte gespeichert');
          } }, 'OK'),
        ),
      ),

      h('div', { class: 'section-title' },
        h('h2', {}, 'Letzte 7 Tage'),
        h('button', { class: 'link small', onclick: () => go('ziele') }, 'Ziel ändern'),
      ),
      h('div', { class: 'card' },
        barChart({
          data: days.map(k => ({ label: fmtDate(k, 'wd'), value: stepsOf(k) })),
          goal, color: 'var(--c-steps)',
        }),
        h('div', { class: 'card-row', style: 'justify-content:space-around;margin-top:10px' },
          stat('Ø / Tag', avg(days.map(stepsOf))),
          stat('Summe', days.reduce((a, k) => a + stepsOf(k), 0)),
          stat('Bester Tag', Math.max(...days.map(stepsOf))),
        ),
      ),
    );

    function setSteps(v) {
      store.update(st => {
        if (!st.days[today]) st.days[today] = {};
        st.days[today].steps = Math.max(0, v);
      });
      refresh();
    }
  },
};

const avg = arr => { const f = arr.filter(v => v > 0); return f.length ? Math.round(f.reduce((a, b) => a + b, 0) / f.length) : 0; };
const stat = (label, val) => h('div', { style: 'text-align:center' },
  h('div', { class: 'num', style: 'font-weight:800;font-size:17px' }, fmtNum(val)),
  h('div', { class: 'small muted' }, label));
