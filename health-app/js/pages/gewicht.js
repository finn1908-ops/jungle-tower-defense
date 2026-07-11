// Gewichtstracker: Verlaufs-Chart mit Zielgewicht-Linie, Trend,
// BMI (falls Größe hinterlegt) und Verlaufliste.

import { store, uid, todayKey, fmtNum, fmtDate, latestWeight } from '../store.js';
import { h, icon, lineChart, sheet, toast, input, field, segment, emptyState, confirmSheet } from '../ui.js';
import { refresh, go } from '../app.js';

let range = 30; // Tage; 0 = alle

export default {
  title: 'Gewicht',
  render(el) {
    const s = store.get();
    const all = [...s.weights].sort((a, b) => a.date.localeCompare(b.date));
    const latest = latestWeight();
    const target = s.goals.weightTargetKg;

    const cutoff = range ? addDaysStr(todayKey(), -range) : null;
    const view = cutoff ? all.filter(w => w.date >= cutoff) : all;

    // Trend: Differenz zum ältesten Wert im Zeitraum
    const delta = view.length >= 2 ? view[view.length - 1].kg - view[0].kg : null;

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Gewicht'),
          h('div', { class: 'sub' }, target ? `Zielgewicht: ${fmtNum(target, 1)} kg` : 'Kein Zielgewicht gesetzt'),
        ),
        h('button', { class: 'btn btn-primary btn-s', onclick: () => entrySheet() }, icon('plus', 16), 'Wiegen'),
      ),
    );

    if (!all.length) {
      el.append(emptyState('scale', 'Noch keine Messung',
        'Trag dein erstes Gewicht ein – ab der zweiten Messung siehst du hier deinen Trend.',
        h('button', { class: 'btn btn-primary btn-s', onclick: () => entrySheet() }, 'Erste Messung eintragen')));
      return;
    }

    el.append(
      h('div', { class: 'card' },
        h('div', { class: 'card-row', style: 'justify-content:space-between;margin-bottom:4px' },
          h('div', {},
            h('div', { class: 'stat-big' }, fmtNum(latest.kg, 1), h('small', {}, ' kg')),
            h('div', { class: 'small muted' }, `Zuletzt: ${fmtDate(latest.date)}`),
          ),
          delta !== null ? h('span', { class: 'badge tint', style: `--badge-c:${delta <= 0 ? 'var(--ok)' : 'var(--warn)'}` },
            `${delta > 0 ? '+' : ''}${fmtNum(delta, 1)} kg`) : null,
          target ? h('div', { style: 'text-align:right' },
            h('div', { class: 'num', style: 'font-weight:800;font-size:17px' }, `${fmtNum(Math.abs(latest.kg - target), 1)} kg`),
            h('div', { class: 'small muted' }, latest.kg > target ? 'bis zum Ziel' : 'unter dem Ziel'),
          ) : null,
        ),
        segment([
          { label: '7 T', value: 7 }, { label: '30 T', value: 30 }, { label: '90 T', value: 90 }, { label: 'Alle', value: 0 },
        ], range, v => { range = v; refresh(); }),
        view.length >= 2
          ? lineChart({
              data: view.map(w => ({ x: fmtDate(w.date), value: w.kg })),
              goal: target || null, color: 'var(--c-weight)',
              formatValue: v => `${fmtNum(v, 1)} kg`,
            })
          : h('p', { class: 'small muted', style: 'text-align:center;padding:14px 0' }, 'Im gewählten Zeitraum gibt es weniger als zwei Messungen.'),
        target ? h('div', { class: 'small muted', style: 'text-align:center;margin-top:6px' }, 'Gestrichelte Linie = Zielgewicht') : null,
      ),
      bmiCard(s, latest),
      h('div', { class: 'section-title' },
        h('h2', {}, 'Messungen'),
        h('button', { class: 'link small', onclick: () => go('ziele') }, 'Zielgewicht ändern'),
      ),
      h('div', { class: 'list' },
        [...all].reverse().slice(0, 30).map(w => h('div', { class: 'row' },
          h('div', { class: 'module-ic', style: '--mc:var(--c-weight)' }, icon('scale', 20)),
          h('div', { class: 'grow' },
            h('div', { class: 'title num' }, `${fmtNum(w.kg, 1)} kg`),
            h('div', { class: 'sub' }, fmtDate(w.date, 'long')),
          ),
          h('button', { class: 'icon-btn', 'aria-label': 'Löschen', onclick: () =>
            confirmSheet('Messung löschen?', `${fmtNum(w.kg, 1)} kg vom ${fmtDate(w.date)} entfernen?`, 'Löschen', () => {
              store.update(st => { st.weights = st.weights.filter(x => x.id !== w.id); });
              refresh();
            }) }, icon('trash', 16)),
        )),
      ),
    );

    function entrySheet() {
      const kgIn = input({ type: 'number', inputmode: 'decimal', step: '0.1', placeholder: latest ? fmtNum(latest.kg, 1) : 'z. B. 82,4' });
      const dateIn = input({ type: 'date', value: todayKey(), max: todayKey() });
      const sh = sheet('Gewicht eintragen', h('div', {},
        field('Gewicht (kg)', kgIn),
        field('Datum', dateIn),
        h('button', { class: 'btn btn-primary btn-block', onclick: () => {
          const kg = parseFloat(kgIn.value.replace(',', '.'));
          if (!Number.isFinite(kg) || kg < 20 || kg > 400) return toast('Bitte gültiges Gewicht', 'warn');
          const date = dateIn.value || todayKey();
          store.update(st => {
            const ex = st.weights.find(w => w.date === date);
            if (ex) ex.kg = kg; else st.weights.push({ id: uid(), date, kg });
          });
          toast('Gewicht gespeichert'); sh.close(); refresh();
        } }, 'Speichern'),
      ));
      setTimeout(() => kgIn.focus(), 320);
    }
  },
};

function bmiCard(s, latest) {
  const cm = s.settings.heightCm;
  if (!cm || !latest) {
    return h('div', { class: 'notice', style: 'margin-bottom:12px' }, icon('user', 18),
      h('span', {}, 'Hinterlege deine Größe in den ', h('button', { class: 'link', onclick: () => go('einstellungen') }, 'Einstellungen'), ', um deinen BMI zu sehen.'));
  }
  const bmi = latest.kg / ((cm / 100) ** 2);
  const cat = bmi < 18.5 ? 'Untergewicht' : bmi < 25 ? 'Normalgewicht' : bmi < 30 ? 'Übergewicht' : 'Adipositas';
  return h('div', { class: 'card pad-s card-row' },
    h('div', { class: 'module-ic', style: '--mc:var(--c-weight)' }, icon('target', 20)),
    h('div', { class: 'grow' },
      h('div', { class: 'title' }, `BMI ${fmtNum(bmi, 1)}`),
      h('div', { class: 'sub' }, `${cat} · bei ${cm} cm Körpergröße`),
    ),
  );
}

function addDaysStr(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}
