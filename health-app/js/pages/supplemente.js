// Supplement-Tracker: Einnahmeplan (morgens/mittags/abends),
// tägliche Abhak-Checkliste und Compliance über 30 Tage.

import { store, uid, todayKey, lastDays, fmtNum } from '../store.js';
import { h, icon, sheet, toast, input, field, emptyState, confirmSheet, progressBar } from '../ui.js';
import { refresh } from '../app.js';

const TIMES = [
  { id: 'morgens', label: 'Morgens' },
  { id: 'mittags', label: 'Mittags' },
  { id: 'abends', label: 'Abends' },
];

export default {
  title: 'Supplemente',
  render(el) {
    const s = store.get();
    const today = todayKey();
    const taken = s.days[today]?.supps || {};

    const total = s.supplements.reduce((a, sup) => a + (sup.times?.length || 1), 0);
    const done = s.supplements.reduce((a, sup) => a + (sup.times || []).filter(t => taken[sup.id]?.[t]).length, 0);

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Supplemente'),
          h('div', { class: 'sub' }, total ? `Heute: ${done} von ${total} genommen` : 'Dein täglicher Einnahmeplan'),
        ),
        h('button', { class: 'btn btn-primary btn-s', onclick: () => editSheet(null) }, icon('plus', 16), 'Neu'),
      ),
    );

    if (!s.supplements.length) {
      el.append(emptyState('pill', 'Noch keine Supplemente',
        'Leg deine Supplemente mit Dosis und Einnahmezeit an – danach hakst du sie täglich einfach ab.',
        h('button', { class: 'btn btn-primary btn-s', onclick: () => editSheet(null) }, 'Erstes Supplement anlegen')));
      return;
    }

    el.append(
      total ? h('div', { class: 'card pad-s' },
        h('div', { style: 'display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px' },
          h('span', { class: 'muted', style: 'font-weight:600' }, 'Heute'),
          h('span', { class: 'num', style: 'font-weight:700' }, `${total ? Math.round((done / total) * 100) : 0} %`),
        ),
        progressBar(done, total, 'var(--c-supp)'),
      ) : null,
    );

    // Checkliste je Tageszeit
    TIMES.forEach(t => {
      const list = s.supplements.filter(sup => (sup.times || []).includes(t.id));
      if (!list.length) return;
      el.append(
        h('div', { class: 'section-title' }, h('h2', {}, t.label)),
        h('div', { class: 'list' }, list.map(sup => {
          const on = !!taken[sup.id]?.[t.id];
          return h('div', { class: 'row' + (on ? ' done' : '') },
            h('button', {
              class: 'check' + (on ? ' on' : ''), style: '--check-c:var(--c-supp)',
              'aria-label': `${sup.name} ${t.label} abhaken`,
              onclick: () => {
                store.update(st => {
                  if (!st.days[today]) st.days[today] = {};
                  if (!st.days[today].supps) st.days[today].supps = {};
                  if (!st.days[today].supps[sup.id]) st.days[today].supps[sup.id] = {};
                  st.days[today].supps[sup.id][t.id] = !on;
                });
                refresh();
              },
            }, icon('check', 16)),
            h('div', { class: 'grow' },
              h('div', { class: 'title' }, sup.name),
              sup.dose ? h('div', { class: 'sub' }, sup.dose) : null,
            ),
            h('button', { class: 'icon-btn', 'aria-label': 'Bearbeiten', onclick: () => editSheet(sup) }, icon('edit', 16)),
          );
        })),
      );
    });

    // Compliance 30 Tage
    const days = lastDays(30);
    let evaluated = 0, hit = 0;
    days.forEach(k => {
      const tk = s.days[k]?.supps || {};
      const dTotal = s.supplements.reduce((a, sup) => a + (sup.times?.length || 0), 0);
      const dDone = s.supplements.reduce((a, sup) => a + (sup.times || []).filter(t => tk[sup.id]?.[t]).length, 0);
      if (dDone > 0) { evaluated++; if (dDone >= dTotal) hit++; }
    });
    el.append(
      h('div', { class: 'section-title' }, h('h2', {}, 'Konstanz (30 Tage)')),
      h('div', { class: 'card pad-s card-row' },
        h('div', { class: 'module-ic', style: '--mc:var(--c-supp)' }, icon('checks', 20)),
        h('div', { class: 'grow' },
          h('div', { class: 'title num' }, evaluated ? `${Math.round((hit / evaluated) * 100)} % vollständige Tage` : 'Noch keine Daten'),
          h('div', { class: 'sub' }, evaluated ? `${hit} von ${evaluated} erfassten Tagen komplett` : 'Hak deine erste Einnahme ab.'),
        ),
      ),
    );

    function editSheet(sup) {
      const nameIn = input({ type: 'text', value: sup?.name || '', placeholder: 'z. B. Kreatin' });
      const doseIn = input({ type: 'text', value: sup?.dose || '', placeholder: 'z. B. 5 g' });
      const sel = new Set(sup?.times || ['morgens']);
      const timeChips = h('div', { class: 'chip-row', style: 'margin-bottom:16px' },
        TIMES.map(t => {
          const b = h('button', { class: 'chip' + (sel.has(t.id) ? ' active' : ''), onclick: () => {
            sel.has(t.id) ? sel.delete(t.id) : sel.add(t.id);
            b.classList.toggle('active');
          } }, t.label);
          return b;
        }));

      const sh = sheet(sup ? 'Supplement bearbeiten' : 'Neues Supplement', h('div', {},
        field('Name', nameIn),
        field('Dosis (optional)', doseIn),
        h('div', { class: 'field-label', style: 'margin-bottom:6px' }, 'Einnahmezeiten'),
        timeChips,
        h('button', { class: 'btn btn-primary btn-block', onclick: () => {
          const name = nameIn.value.trim();
          if (!name) return toast('Name fehlt', 'warn');
          if (!sel.size) return toast('Mindestens eine Einnahmezeit wählen', 'warn');
          store.update(st => {
            if (sup) Object.assign(st.supplements.find(x => x.id === sup.id), { name, dose: doseIn.value.trim(), times: [...sel] });
            else st.supplements.push({ id: uid(), name, dose: doseIn.value.trim(), times: [...sel] });
          });
          sh.close(); refresh();
        } }, 'Speichern'),
        sup ? h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px;color:var(--danger)', onclick: () =>
          confirmSheet('Supplement löschen?', `„${sup.name}" wird aus deinem Plan entfernt.`, 'Löschen', () => {
            store.update(st => { st.supplements = st.supplements.filter(x => x.id !== sup.id); });
            sh.close(); refresh();
          }) }, 'Löschen') : null,
      ));
    }
  },
};
