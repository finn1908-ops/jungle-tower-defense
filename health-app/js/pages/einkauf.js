// Einkaufsliste: Artikel mit Kategorien, Abhaken mit Durchstreichen,
// "Erledigte löschen".

import { store, uid } from '../store.js';
import { h, icon, toast, input, emptyState, confirmSheet } from '../ui.js';
import { refresh } from '../app.js';

const CATEGORIES = ['Obst & Gemüse', 'Kühlregal', 'Fleisch & Fisch', 'Vorrat', 'Getränke', 'Tiefkühl', 'Drogerie', 'Sonstiges'];

export default {
  title: 'Einkaufsliste',
  render(el) {
    const s = store.get();
    const open = s.shopping.filter(i => !i.done);
    const done = s.shopping.filter(i => i.done);

    const nameIn = input({ type: 'text', placeholder: 'Artikel hinzufügen …', style: 'flex:1' });
    const catSel = h('select', { class: 'input', style: 'max-width:150px' },
      CATEGORIES.map(c => h('option', { value: c }, c)));

    const addItem = () => {
      const name = nameIn.value.trim();
      if (!name) return;
      store.update(st => st.shopping.push({ id: uid(), name, category: catSel.value, done: false }));
      nameIn.value = '';
      refresh();
      setTimeout(() => document.querySelector('.page input[type="text"]')?.focus(), 60);
    };
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Einkaufsliste'),
          h('div', { class: 'sub' }, open.length ? `${open.length} ${open.length === 1 ? 'Artikel' : 'Artikel'} offen` : 'Alles im Korb'),
        ),
        done.length ? h('button', { class: 'btn btn-ghost btn-s', onclick: () =>
          confirmSheet('Erledigte löschen?', `${done.length} abgehakte Artikel werden entfernt.`, 'Löschen', () => {
            store.update(st => { st.shopping = st.shopping.filter(i => !i.done); });
            refresh();
          }) }, icon('trash', 15), `${done.length}`) : null,
      ),
      h('div', { class: 'card pad-s' },
        h('div', { class: 'card-row' }, nameIn, catSel,
          h('button', { class: 'icon-btn accent', 'aria-label': 'Hinzufügen', onclick: addItem }, icon('plus', 20))),
      ),
    );

    if (!s.shopping.length) {
      el.append(emptyState('cart', 'Liste ist leer',
        'Füge oben Artikel hinzu – sie werden automatisch nach Kategorien gruppiert, so wie du durch den Laden läufst.'));
      return;
    }

    // offene Artikel nach Kategorie
    CATEGORIES.forEach(cat => {
      const items = open.filter(i => i.category === cat);
      if (!items.length) return;
      el.append(
        h('div', { class: 'section-title' }, h('h2', {}, cat), h('span', { class: 'small muted num' }, String(items.length))),
        h('div', { class: 'list' }, items.map(i => itemRow(i))),
      );
    });

    if (done.length) {
      el.append(
        h('div', { class: 'section-title' }, h('h2', {}, 'Im Korb')),
        h('div', { class: 'list' }, done.map(i => itemRow(i))),
      );
    }

    function itemRow(i) {
      return h('div', { class: 'row' + (i.done ? ' done' : '') },
        h('button', {
          class: 'check' + (i.done ? ' on' : ''), style: '--check-c:var(--c-steps)', 'aria-label': 'Abhaken',
          onclick: () => {
            store.update(st => { const x = st.shopping.find(y => y.id === i.id); x.done = !x.done; });
            refresh();
          },
        }, icon('check', 16)),
        h('div', { class: 'grow title' }, i.name),
        h('button', { class: 'icon-btn', 'aria-label': 'Entfernen', onclick: () => {
          store.update(st => { st.shopping = st.shopping.filter(x => x.id !== i.id); });
          refresh();
        } }, icon('x', 16)),
      );
    }
  },
};
