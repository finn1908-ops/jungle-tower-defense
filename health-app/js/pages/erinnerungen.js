// Erinnerungen: Datum/Uhrzeit, Wiederholung, Vorlaufzeit –
// mit .ics-Export in den iOS-Kalender für echte Benachrichtigungen.

import { store, uid, todayKey, relDay, remindersFor } from '../store.js';
import { h, icon, sheet, toast, input, field, segment, emptyState, confirmSheet } from '../ui.js';
import { downloadIcs } from '../ics.js';
import { refresh } from '../app.js';

const REPEATS = [
  { id: 'none', label: 'Einmalig' },
  { id: 'daily', label: 'Täglich' },
  { id: 'weekly', label: 'Wöchentlich' },
];

export default {
  title: 'Erinnerungen',
  render(el) {
    const s = store.get();
    const today = todayKey();
    const dueToday = remindersFor(today);

    const upcoming = [...s.reminders].sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Erinnerungen'),
          h('div', { class: 'sub' }, dueToday.length ? `${dueToday.length} heute fällig` : 'Nichts für heute'),
        ),
        h('button', { class: 'btn btn-primary btn-s', onclick: () => editReminder(null) }, icon('plus', 16), 'Neu'),
      ),
      h('div', { class: 'notice', style: 'margin-bottom:14px' }, icon('bell', 18),
        h('span', {}, 'Für echte Push-Benachrichtigungen: Tippe bei einer Erinnerung auf ',
          h('b', {}, '„→ Kalender"'),
          ' – sie landet mit Alarm in deinem iOS-Kalender und meldet sich auch bei geschlossener App.')),
    );

    if (!upcoming.length) {
      el.append(emptyState('bell', 'Keine Erinnerungen',
        'Lege Erinnerungen mit Uhrzeit und Wiederholung an – z. B. „Kreatin nehmen" jeden Morgen.',
        h('button', { class: 'btn btn-primary btn-s', onclick: () => editReminder(null) }, 'Erste Erinnerung anlegen')));
      return;
    }

    el.append(h('div', { class: 'list' }, upcoming.map(r => {
      const isPast = r.repeat === 'none' && r.date < today;
      return h('div', { class: 'row', style: isPast ? 'opacity:.55' : '' },
        h('div', { class: 'module-ic', style: '--mc:var(--c-note)' }, icon('bell', 20)),
        h('div', { class: 'grow', onclick: () => editReminder(r) },
          h('div', { class: 'title' }, r.title),
          h('div', { class: 'sub' }, [
            r.repeat === 'none' ? relDay(r.date) : REPEATS.find(x => x.id === r.repeat).label + ` ab ${relDay(r.date)}`,
            r.time ? `${r.time} Uhr` : null,
            isPast ? 'vorbei' : null,
          ].filter(Boolean).join(' · ')),
        ),
        h('button', { class: 'btn btn-ghost btn-s', 'aria-label': 'In iOS-Kalender übernehmen', onclick: () => {
          downloadIcs({ title: r.title, date: r.date, time: r.time || '09:00', repeat: r.repeat !== 'none' ? r.repeat : null, leadMin: r.lead ?? 0, note: 'Aus Pulse' });
          toast('Kalender-Datei erstellt – jetzt „Hinzufügen" tippen');
        } }, '→ Kalender'),
      );
    })));

    function editReminder(r) {
      const titleIn = input({ type: 'text', value: r?.title || '', placeholder: 'Woran erinnern?' });
      const dateIn = input({ type: 'date', value: r?.date || today, min: r ? undefined : today });
      const timeIn = input({ type: 'time', value: r?.time || '09:00' });
      let repeat = r?.repeat || 'none';
      let lead = r?.lead ?? 0;

      const sh = sheet(r ? 'Erinnerung bearbeiten' : 'Neue Erinnerung', h('div', {},
        field('Titel', titleIn),
        h('div', { class: 'input-grid' }, field('Datum', dateIn), field('Uhrzeit', timeIn)),
        h('div', { class: 'field-label', style: 'margin-bottom:6px' }, 'Wiederholung'),
        segment(REPEATS.map(x => ({ label: x.label, value: x.id })), repeat, v => { repeat = v; }),
        h('div', { class: 'field-label', style: 'margin-bottom:6px' }, 'Alarm (für Kalender-Export)'),
        segment([
          { label: 'Pünktlich', value: 0 }, { label: '10 Min. vorher', value: 10 }, { label: '1 Std. vorher', value: 60 },
        ], lead, v => { lead = v; }),
        h('button', { class: 'btn btn-primary btn-block', onclick: () => {
          const title = titleIn.value.trim();
          if (!title) return toast('Titel fehlt', 'warn');
          if (!dateIn.value) return toast('Datum fehlt', 'warn');
          store.update(st => {
            const data = { title, date: dateIn.value, time: timeIn.value || '09:00', repeat, lead };
            if (r) Object.assign(st.reminders.find(x => x.id === r.id), data);
            else st.reminders.push({ id: uid(), ...data });
          });
          sh.close(); refresh();
        } }, 'Speichern'),
        h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px', onclick: () => {
          const title = titleIn.value.trim();
          if (!title || !dateIn.value) return toast('Erst Titel und Datum angeben', 'warn');
          downloadIcs({ title, date: dateIn.value, time: timeIn.value || '09:00', repeat: repeat !== 'none' ? repeat : null, leadMin: lead, note: 'Aus Pulse' });
          toast('Kalender-Datei erstellt');
        } }, icon('export', 17), 'In iOS-Kalender übernehmen'),
        r ? h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px;color:var(--danger)', onclick: () =>
          confirmSheet('Erinnerung löschen?', `„${r.title}" wird entfernt. (Ein bereits exportierter Kalender-Termin bleibt im iOS-Kalender bestehen.)`, 'Löschen', () => {
            store.update(st => { st.reminders = st.reminders.filter(x => x.id !== r.id); });
            sh.close(); refresh();
          }) }, 'Löschen') : null,
      ));
      setTimeout(() => { if (!r) titleIn.focus(); }, 320);
    }
  },
};
