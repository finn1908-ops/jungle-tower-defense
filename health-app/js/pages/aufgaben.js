// Aufgaben: Fälligkeit, Priorität, Zuweisung an Personen ("verteilen"),
// gruppiert in Überfällig / Heute / Geplant / Ohne Datum / Erledigt.

import { store, uid, todayKey, relDay } from '../store.js';
import { h, icon, sheet, toast, input, field, segment, emptyState, confirmSheet } from '../ui.js';
import { refresh } from '../app.js';

const PRIOS = [
  { id: 'high', label: 'Hoch', color: 'var(--danger)' },
  { id: 'mid', label: 'Mittel', color: 'var(--warn)' },
  { id: 'low', label: 'Niedrig', color: 'var(--c-task)' },
];

let filterPerson = 'alle';

export default {
  title: 'Aufgaben',
  render(el) {
    const s = store.get();
    const today = todayKey();
    const people = s.settings.people || ['Ich'];

    const open = s.tasks.filter(t => !t.done && (filterPerson === 'alle' || t.assignee === filterPerson));
    const done = s.tasks.filter(t => t.done && (filterPerson === 'alle' || t.assignee === filterPerson))
      .sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).slice(0, 12);

    const groups = [
      { label: 'Überfällig', list: open.filter(t => t.due && t.due < today).sort(byDue) },
      { label: 'Heute', list: open.filter(t => t.due === today) },
      { label: 'Geplant', list: open.filter(t => t.due && t.due > today).sort(byDue) },
      { label: 'Ohne Datum', list: open.filter(t => !t.due) },
    ];

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Aufgaben'),
          h('div', { class: 'sub' }, `${open.length} offen`),
        ),
        h('button', { class: 'btn btn-primary btn-s', onclick: () => editTask(null) }, icon('plus', 16), 'Neu'),
      ),
      // Personen-Filter
      h('div', { class: 'chip-row', style: 'margin-bottom:14px' },
        ['alle', ...people].map(p => h('button', {
          class: 'chip' + (filterPerson === p ? ' active' : ''),
          onclick: () => { filterPerson = p; refresh(); },
        }, p === 'alle' ? 'Alle' : p)),
        h('button', { class: 'chip', 'aria-label': 'Personen verwalten', onclick: managePeople }, icon('user', 15), '+'),
      ),
    );

    if (!open.length && !done.length) {
      el.append(emptyState('checks', 'Alles erledigt',
        'Lege Aufgaben an, gib ihnen Priorität und Termin – und verteile sie an Personen.',
        h('button', { class: 'btn btn-primary btn-s', onclick: () => editTask(null) }, 'Erste Aufgabe anlegen')));
      return;
    }

    groups.forEach(gr => {
      if (!gr.list.length) return;
      el.append(
        h('div', { class: 'section-title' }, h('h2', {}, gr.label), h('span', { class: 'small muted num' }, String(gr.list.length))),
        h('div', { class: 'list' }, gr.list.map(t => taskRow(t))),
      );
    });

    if (done.length) {
      el.append(
        h('div', { class: 'section-title' }, h('h2', {}, 'Erledigt')),
        h('div', { class: 'list' }, done.map(t => taskRow(t))),
      );
    }

    function taskRow(t) {
      const prio = PRIOS.find(p => p.id === t.priority) || PRIOS[2];
      return h('div', { class: 'row' + (t.done ? ' done' : '') },
        h('button', {
          class: 'check' + (t.done ? ' on' : ''), style: `--check-c:${prio.color}`, 'aria-label': 'Aufgabe abhaken',
          onclick: () => {
            store.update(st => {
              const x = st.tasks.find(y => y.id === t.id);
              x.done = !x.done; x.doneAt = x.done ? Date.now() : null;
            });
            refresh();
          },
        }, icon('check', 16)),
        h('div', { class: 'grow', onclick: () => editTask(t) },
          h('div', { class: 'title' }, t.title),
          h('div', { class: 'sub' }, [
            t.due ? relDay(t.due) : null,
            t.assignee && t.assignee !== 'Ich' ? `→ ${t.assignee}` : null,
            prio.id !== 'low' ? prio.label : null,
          ].filter(Boolean).join(' · ') || 'Ohne Termin'),
        ),
        t.assignee && t.assignee !== 'Ich'
          ? h('span', { class: 'badge tint', style: '--badge-c:var(--c-task)' }, t.assignee[0].toUpperCase())
          : null,
      );
    }

    function editTask(t) {
      const titleIn = input({ type: 'text', value: t?.title || '', placeholder: 'Was ist zu tun?' });
      const dueIn = input({ type: 'date', value: t?.due || '' });
      let priority = t?.priority || 'low';
      let assignee = t?.assignee || 'Ich';

      const sh = sheet(t ? 'Aufgabe bearbeiten' : 'Neue Aufgabe', h('div', {},
        field('Aufgabe', titleIn),
        field('Fällig am (optional)', dueIn),
        h('div', { class: 'field-label', style: 'margin-bottom:6px' }, 'Priorität'),
        segment(PRIOS.map(p => ({ label: p.label, value: p.id })), priority, v => { priority = v; }),
        h('div', { class: 'field-label', style: 'margin-bottom:6px' }, 'Zugewiesen an'),
        h('div', { class: 'chip-row', style: 'margin-bottom:16px' }, people.map(p => {
          const b = h('button', { class: 'chip' + (assignee === p ? ' active' : ''), onclick: e => {
            assignee = p;
            e.currentTarget.parentElement.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
          } }, p);
          return b;
        })),
        h('button', { class: 'btn btn-primary btn-block', onclick: () => {
          const title = titleIn.value.trim();
          if (!title) return toast('Aufgabe fehlt', 'warn');
          store.update(st => {
            if (t) Object.assign(st.tasks.find(x => x.id === t.id), { title, due: dueIn.value || null, priority, assignee });
            else st.tasks.push({ id: uid(), title, due: dueIn.value || null, priority, assignee, done: false, createdAt: Date.now() });
          });
          sh.close(); refresh();
        } }, 'Speichern'),
        t ? h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px;color:var(--danger)', onclick: () =>
          confirmSheet('Aufgabe löschen?', `„${t.title}" wird entfernt.`, 'Löschen', () => {
            store.update(st => { st.tasks = st.tasks.filter(x => x.id !== t.id); });
            sh.close(); refresh();
          }) }, 'Löschen') : null,
      ));
      setTimeout(() => { if (!t) titleIn.focus(); }, 320);
    }

    function managePeople() {
      const body = h('div', {});
      const sh = sheet('Personen', body);
      function paint() {
        const st = store.get();
        body.innerHTML = '';
        const nameIn = input({ type: 'text', placeholder: 'Name, z. B. Lisa' });
        body.append(
          h('div', { class: 'list', style: 'margin-bottom:14px' }, st.settings.people.map(p => h('div', { class: 'row' },
            h('div', { class: 'grow title' }, p),
            p !== 'Ich' ? h('button', { class: 'icon-btn', 'aria-label': 'Person entfernen', onclick: () => {
              store.update(x => {
                x.settings.people = x.settings.people.filter(y => y !== p);
                x.tasks.forEach(task => { if (task.assignee === p) task.assignee = 'Ich'; });
              });
              if (filterPerson === p) filterPerson = 'alle';
              paint(); refresh();
            } }, icon('trash', 16)) : null,
          ))),
          h('div', { class: 'card-row' },
            h('div', { class: 'grow' }, nameIn),
            h('button', { class: 'btn btn-primary', onclick: () => {
              const name = nameIn.value.trim();
              if (!name) return;
              store.update(x => { if (!x.settings.people.includes(name)) x.settings.people.push(name); });
              paint(); refresh();
            } }, 'OK'),
          ),
        );
      }
      paint();
    }
  },
};

const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999');
