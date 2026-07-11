// Notizen: Farben, Anpinnen, Volltextsuche.

import { store, uid } from '../store.js';
import { h, icon, sheet, toast, input, field, emptyState, confirmSheet } from '../ui.js';
import { refresh } from '../app.js';

const COLORS = ['var(--accent)', 'var(--c-kcal)', 'var(--c-water)', 'var(--c-steps)', 'var(--c-weight)', 'var(--c-train)'];

let query = '';

export default {
  title: 'Notizen',
  render(el) {
    const s = store.get();
    const searchIn = input({ type: 'search', placeholder: 'Notizen durchsuchen …', value: query, oninput: e => { query = e.target.value; refresh(); } });

    const list = [...s.notes]
      .filter(n => (n.title + ' ' + n.text).toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt || 0) - (a.updatedAt || 0));

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Notizen'),
          h('div', { class: 'sub' }, `${s.notes.length} ${s.notes.length === 1 ? 'Notiz' : 'Notizen'}`),
        ),
        h('button', { class: 'btn btn-primary btn-s', onclick: () => editNote(null) }, icon('plus', 16), 'Neu'),
      ),
      h('div', { style: 'margin-bottom:12px' }, searchIn),
    );

    if (!list.length) {
      el.append(emptyState('note', query ? 'Nichts gefunden' : 'Noch keine Notizen',
        query ? 'Versuch einen anderen Suchbegriff.' : 'Halte Gedanken, Ideen und Wichtiges fest – mit Farbe und Pin für den Überblick.',
        query ? null : h('button', { class: 'btn btn-primary btn-s', onclick: () => editNote(null) }, 'Erste Notiz schreiben')));
      return;
    }

    el.append(h('div', { class: 'list' }, list.map(n =>
      h('div', { class: 'card pad-s note-card clickable', style: `--nc:${n.color};margin-bottom:0`, onclick: () => editNote(n) },
        h('div', { class: 'card-row' },
          h('div', { class: 'grow' },
            h('div', { style: 'font-weight:700;font-size:15px' }, n.pinned ? '📌 ' + (n.title || 'Ohne Titel') : (n.title || 'Ohne Titel')),
            n.text ? h('p', { class: 'small muted', style: 'margin-top:3px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap' }, n.text) : null,
          ),
        ),
      ))));

    function editNote(n) {
      const titleIn = input({ type: 'text', value: n?.title || '', placeholder: 'Titel' });
      const textIn = h('textarea', { class: 'input', placeholder: 'Deine Notiz …', style: 'min-height:140px' });
      if (n?.text) textIn.value = n.text;
      let color = n?.color || COLORS[0];
      let pinned = !!n?.pinned;

      const colorRow = h('div', { class: 'note-colors', style: 'margin-bottom:16px' }, COLORS.map(c => {
        const b = h('button', { class: 'note-color' + (c === color ? ' active' : ''), style: `background:${c}`, 'aria-label': 'Farbe wählen', onclick: () => {
          color = c;
          colorRow.querySelectorAll('.note-color').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
        } });
        return b;
      }));

      const pinBtn = h('button', { class: 'chip' + (pinned ? ' active' : ''), onclick: () => { pinned = !pinned; pinBtn.classList.toggle('active'); } }, icon('pin', 15), 'Anpinnen');

      const sh = sheet(n ? 'Notiz bearbeiten' : 'Neue Notiz', h('div', {},
        field('Titel', titleIn),
        h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Notiz'), textIn),
        h('div', { class: 'field-label', style: 'margin-bottom:6px' }, 'Farbe'),
        colorRow,
        h('div', { style: 'margin-bottom:16px' }, pinBtn),
        h('button', { class: 'btn btn-primary btn-block', onclick: () => {
          const title = titleIn.value.trim(), text = textIn.value.trim();
          if (!title && !text) return toast('Notiz ist leer', 'warn');
          store.update(st => {
            if (n) Object.assign(st.notes.find(x => x.id === n.id), { title, text, color, pinned, updatedAt: Date.now() });
            else st.notes.push({ id: uid(), title, text, color, pinned, updatedAt: Date.now() });
          });
          sh.close(); refresh();
        } }, 'Speichern'),
        n ? h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px;color:var(--danger)', onclick: () =>
          confirmSheet('Notiz löschen?', `„${n.title || 'Ohne Titel'}" wird endgültig entfernt.`, 'Löschen', () => {
            store.update(st => { st.notes = st.notes.filter(x => x.id !== n.id); });
            sh.close(); refresh();
          }) }, 'Löschen') : null,
      ));
    }
  },
};
