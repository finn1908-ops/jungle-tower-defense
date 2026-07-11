// Kalender: Monatsansicht mit Markierungen aus allen Modulen
// (Trainings, Erinnerungen, Aufgaben, eigene Termine) + Tagesdetail.

import { store, uid, todayKey, fmtDate, relDay, plannedFor, remindersFor, keyToDate } from '../store.js';
import { h, icon, sheet, toast, input, field, calendarGrid, emptyState, confirmSheet } from '../ui.js';
import { downloadIcs } from '../ics.js';
import { refresh, go } from '../app.js';

let monthDate = new Date();
let selected = todayKey();

export default {
  title: 'Kalender',
  render(el) {
    const s = store.get();

    // Markierungen sammeln: Modul-Farben je Tag
    const marks = {};
    const push = (key, color) => { (marks[key] ||= []).push(color); };

    s.workouts.forEach(w => push(w.date, 'var(--c-train)'));
    s.events.forEach(e => push(e.date, 'var(--c-event)'));
    s.tasks.filter(t => t.due && !t.done).forEach(t => push(t.due, 'var(--c-task)'));
    s.reminders.filter(r => r.repeat === 'none').forEach(r => push(r.date, 'var(--c-note)'));
    // geplante Trainings im sichtbaren Monat (einmalig + wiederkehrend)
    const y = monthDate.getFullYear(), m = monthDate.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (plannedFor(key).length && !s.workouts.some(w => w.date === key)) push(key, 'var(--c-train)');
      if (remindersFor(key).some(r => r.repeat !== 'none')) push(key, 'var(--c-note)');
    }

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Kalender'),
          h('div', { class: 'sub' }, 'Alles Geplante auf einen Blick'),
        ),
        h('button', { class: 'btn btn-primary btn-s', onclick: () => editEvent(null) }, icon('plus', 16), 'Termin'),
      ),

      h('div', { class: 'card' },
        h('div', { class: 'card-row', style: 'justify-content:space-between;margin-bottom:10px' },
          h('button', { class: 'icon-btn', 'aria-label': 'Voriger Monat', onclick: () => { monthDate = new Date(y, m - 1, 1); refresh(); } }, icon('chevL', 18)),
          h('b', { style: 'font-size:16px' }, fmtDate(`${y}-${String(m + 1).padStart(2, '0')}-01`, 'monthYear')),
          h('button', { class: 'icon-btn', 'aria-label': 'Nächster Monat', onclick: () => { monthDate = new Date(y, m + 1, 1); refresh(); } }, icon('chevR', 18)),
        ),
        calendarGrid({ monthDate, selected, marks, onPick: key => { selected = key; refresh(); } }),
        h('div', { class: 'card-row', style: 'justify-content:center;gap:14px;margin-top:12px;flex-wrap:wrap' },
          legend('var(--c-train)', 'Training'), legend('var(--c-event)', 'Termine'),
          legend('var(--c-task)', 'Aufgaben'), legend('var(--c-note)', 'Erinnerungen'),
        ),
      ),

      h('div', { class: 'section-title' }, h('h2', {}, relDay(selected)),
        h('span', { class: 'small muted' }, fmtDate(selected, 'long'))),
      dayDetail(selected),
    );

    function dayDetail(key) {
      const wrap = h('div', { class: 'list' });
      const entries = [];

      plannedFor(key).forEach(p => entries.push({
        color: 'var(--c-train)', icon: 'dumbbell',
        title: p.template.name,
        sub: `Geplantes Training${p.time ? ` · ${p.time} Uhr` : ''}`,
        action: key >= todayKey() ? h('button', { class: 'btn btn-ghost btn-s', onclick: () => go('training') }, 'Starten') : null,
      }));
      s.workouts.filter(w => w.date === key).forEach(w => entries.push({
        color: 'var(--c-train)', icon: 'check',
        title: w.name, sub: 'Training absolviert',
      }));
      s.events.filter(e => e.date === key).sort((a, b) => (a.time || '').localeCompare(b.time || '')).forEach(e => entries.push({
        color: 'var(--c-event)', icon: 'calendar',
        title: e.title, sub: e.time ? `${e.time} Uhr${e.note ? ' · ' + e.note : ''}` : (e.note || 'Ganztägig'),
        onClick: () => editEvent(e),
        action: h('button', { class: 'btn btn-ghost btn-s', onclick: ev => {
          ev.stopPropagation();
          downloadIcs({ title: e.title, date: e.date, time: e.time || '09:00', note: e.note, leadMin: 60 });
          toast('Kalender-Datei erstellt');
        } }, '→ Kalender'),
      }));
      s.tasks.filter(t => t.due === key && !t.done).forEach(t => entries.push({
        color: 'var(--c-task)', icon: 'checks',
        title: t.title, sub: `Aufgabe${t.assignee && t.assignee !== 'Ich' ? ` · ${t.assignee}` : ''}`,
        onClick: () => go('aufgaben'),
      }));
      remindersFor(key).forEach(r => entries.push({
        color: 'var(--c-note)', icon: 'bell',
        title: r.title, sub: `Erinnerung${r.time ? ` · ${r.time} Uhr` : ''}`,
        onClick: () => go('erinnerungen'),
      }));

      if (!entries.length) {
        return emptyState('calendar', 'Nichts geplant',
          'Für diesen Tag gibt es keine Einträge.',
          h('button', { class: 'btn btn-primary btn-s', onclick: () => editEvent(null) }, 'Termin anlegen'));
      }

      entries.forEach(e => wrap.append(h('div', { class: 'row', onclick: e.onClick || null },
        h('div', { class: 'module-ic', style: `--mc:${e.color}` }, icon(e.icon, 20)),
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, e.title),
          h('div', { class: 'sub' }, e.sub),
        ),
        e.action || null,
      )));
      return wrap;
    }

    function editEvent(e) {
      const titleIn = input({ type: 'text', value: e?.title || '', placeholder: 'z. B. Zahnarzt' });
      const dateIn = input({ type: 'date', value: e?.date || selected });
      const timeIn = input({ type: 'time', value: e?.time || '' });
      const noteIn = input({ type: 'text', value: e?.note || '', placeholder: 'Notiz (optional)' });

      const sh = sheet(e ? 'Termin bearbeiten' : 'Neuer Termin', h('div', {},
        field('Titel', titleIn),
        h('div', { class: 'input-grid' }, field('Datum', dateIn), field('Uhrzeit (optional)', timeIn)),
        field('Notiz', noteIn),
        h('button', { class: 'btn btn-primary btn-block', onclick: () => {
          const title = titleIn.value.trim();
          if (!title || !dateIn.value) return toast('Titel und Datum angeben', 'warn');
          store.update(st => {
            const data = { title, date: dateIn.value, time: timeIn.value || null, note: noteIn.value.trim() || null };
            if (e) Object.assign(st.events.find(x => x.id === e.id), data);
            else st.events.push({ id: uid(), ...data });
          });
          selected = dateIn.value;
          sh.close(); refresh();
        } }, 'Speichern'),
        e ? h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px;color:var(--danger)', onclick: () =>
          confirmSheet('Termin löschen?', `„${e.title}" am ${fmtDate(e.date)} wird entfernt.`, 'Löschen', () => {
            store.update(st => { st.events = st.events.filter(x => x.id !== e.id); });
            sh.close(); refresh();
          }) }, 'Löschen') : null,
      ));
    }
  },
};

const legend = (color, label) => h('span', { class: 'small muted', style: 'display:inline-flex;align-items:center;gap:5px' },
  h('i', { style: `width:8px;height:8px;border-radius:99px;background:${color};display:inline-block` }), label);
