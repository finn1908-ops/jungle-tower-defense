// Kalorientracker: Mahlzeiten-Log mit Makros, Kalorien-Ring,
// eigene Lebensmittel-DB (Favoriten, zuletzt benutzt, Portionsfaktor).

import { store, uid, todayKey, addDays, relDay, kcalOf, mealsOf, fmtNum } from '../store.js';
import { h, icon, ring, sheet, toast, confirmSheet, input, field, segment, emptyState, progressBar } from '../ui.js';
import { refresh, go } from '../app.js';

const SLOTS = [
  { id: 'fruehstueck', label: 'Frühstück' },
  { id: 'mittag', label: 'Mittagessen' },
  { id: 'abend', label: 'Abendessen' },
  { id: 'snack', label: 'Snacks' },
];

let date = todayKey();

export default {
  title: 'Kalorien',
  render(el) {
    if (date > todayKey()) date = todayKey();
    const s = store.get();
    const g = s.goals;
    const sum = kcalOf(date);
    const meals = mealsOf(date);

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Ernährung'),
          h('div', { class: 'sub' }, 'Kalorien & Makros im Blick'),
        ),
        h('button', { class: 'icon-btn', 'aria-label': 'Lebensmittel-Datenbank', onclick: () => foodDbSheet() }, icon('book')),
      ),
      dayNav(),

      // Tagesbilanz
      h('div', { class: 'card' },
        h('div', { class: 'card-row' },
          ring({
            size: 118, stroke: 11, value: sum.kcal, max: g.kcal,
            color: 'var(--c-kcal)', overflowColor: 'var(--danger)',
            label: fmtNum(sum.kcal), sub: `von ${fmtNum(g.kcal)} kcal`,
          }),
          h('div', { class: 'grow', style: 'display:flex;flex-direction:column;gap:10px' },
            macroBar('Protein', sum.p, g.protein, 'var(--c-train)'),
            macroBar('Kohlenhydrate', sum.c, g.carbs, 'var(--c-mood)'),
            macroBar('Fett', sum.f, g.fat, 'var(--c-kcal)'),
          ),
        ),
        h('div', { class: 'divider' }),
        h('div', { class: 'card-row', style: 'justify-content:space-between' },
          h('span', { class: 'small muted' },
            sum.kcal <= g.kcal
              ? `Noch ${fmtNum(g.kcal - sum.kcal)} kcal übrig`
              : `${fmtNum(sum.kcal - g.kcal)} kcal über dem Ziel`),
          h('button', { class: 'link small', onclick: () => go('ziele') }, 'Ziele anpassen'),
        ),
      ),

      // Mahlzeiten
      ...SLOTS.map(slot => {
        const items = meals.filter(m => m.slot === slot.id);
        const slotKcal = items.reduce((a, m) => a + (+m.kcal || 0), 0);
        return h('div', {},
          h('div', { class: 'section-title' },
            h('h2', {}, slot.label),
            h('span', { class: 'small muted num' }, slotKcal ? `${fmtNum(slotKcal)} kcal` : ''),
          ),
          h('div', { class: 'list' },
            ...items.map(m => mealRow(m)),
            h('button', { class: 'row', style: 'justify-content:center;color:var(--accent);font-weight:700', onclick: () => addSheet(slot.id) },
              icon('plus', 18), ` ${slot.label} hinzufügen`),
          ),
        );
      }),
    );

    function dayNav() {
      return h('div', { class: 'card pad-s card-row', style: 'justify-content:space-between' },
        h('button', { class: 'icon-btn', 'aria-label': 'Vorheriger Tag', onclick: () => { date = addDays(date, -1); refresh(); } }, icon('chevL', 18)),
        h('button', { class: 'link', onclick: () => { date = todayKey(); refresh(); } }, relDay(date)),
        h('button', { class: 'icon-btn', 'aria-label': 'Nächster Tag', disabled: date >= todayKey(), onclick: () => { date = addDays(date, 1); refresh(); } }, icon('chevR', 18)),
      );
    }

    function mealRow(m) {
      return h('div', { class: 'row' },
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, m.name),
          h('div', { class: 'sub num' }, `${fmtNum(m.kcal)} kcal · P ${fmtNum(m.p)} · K ${fmtNum(m.c)} · F ${fmtNum(m.f)}`),
        ),
        h('button', { class: 'icon-btn', 'aria-label': 'Eintrag löschen', onclick: () => {
          store.update(st => { st.meals = st.meals.filter(x => x.id !== m.id); });
          toast('Eintrag entfernt'); refresh();
        } }, icon('trash', 17)),
      );
    }
  },
};

function macroBar(label, val, max, color) {
  return h('div', {},
    h('div', { style: 'display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px' },
      h('span', { class: 'muted', style: 'font-weight:600' }, label),
      h('span', { class: 'num', style: 'font-weight:700' }, `${fmtNum(val)} / ${fmtNum(max)} g`),
    ),
    progressBar(val, max, color),
  );
}

// ---------- Hinzufügen: DB-Auswahl oder freie Eingabe ----------

function addSheet(slotId) {
  let mode = 'db';
  const body = h('div', {});
  const sh = sheet('Essen hinzufügen', h('div', {},
    segment([{ label: 'Meine Lebensmittel', value: 'db' }, { label: 'Frei eingeben', value: 'free' }], mode,
      v => { mode = v; paint(); }),
    body,
  ));

  function paint() {
    body.innerHTML = '';
    body.append(mode === 'db' ? dbPicker() : freeForm());
  }

  function dbPicker() {
    const s = store.get();
    const wrap = h('div', {});
    const searchIn = input({ type: 'search', placeholder: 'Suchen …', oninput: () => list.replaceWith(list = buildList(searchIn.value)) });
    let list = buildList('');

    function buildList(q) {
      const foods = [...s.foods]
        .filter(f => f.name.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => (b.fav - a.fav) || (b.lastUsed || 0) - (a.lastUsed || 0));
      if (!foods.length) {
        return h('div', { style: 'margin-top:12px' }, emptyState('book', 'Noch keine Lebensmittel',
          'Leg dir häufige Lebensmittel und Gerichte einmal an – danach trägst du sie mit einem Tipp ein.',
          h('button', { class: 'btn btn-primary btn-s', onclick: () => { mode = 'free'; paint(); } }, 'Erstes Lebensmittel anlegen')));
      }
      return h('div', { class: 'list', style: 'margin-top:12px' }, foods.map(f =>
        h('div', { class: 'row' },
          h('button', { class: 'icon-btn', style: f.fav ? 'color:var(--c-mood)' : '', 'aria-label': 'Favorit', onclick: e => {
            store.update(st => { const x = st.foods.find(y => y.id === f.id); if (x) x.fav = !x.fav; });
            e.currentTarget.style.color = f.fav ? '' : 'var(--c-mood)'; f.fav = !f.fav;
          } }, icon('star', 17)),
          h('div', { class: 'grow', onclick: () => portionSheet(f) },
            h('div', { class: 'title' }, f.name),
            h('div', { class: 'sub num' }, `${fmtNum(f.kcal)} kcal · P ${fmtNum(f.p)} · K ${fmtNum(f.c)} · F ${fmtNum(f.f)} je ${f.per}`),
          ),
          h('button', { class: 'icon-btn accent', 'aria-label': 'Hinzufügen', onclick: () => portionSheet(f) }, icon('plus', 18)),
        )));
    }

    function portionSheet(f) {
      const factorIn = input({ type: 'number', inputmode: 'decimal', step: '0.1', value: '1', placeholder: '1' });
      const inner = sheet(f.name, h('div', {},
        field(f.per === '100 g' ? 'Menge (× 100 g)' : 'Portionen', factorIn,
          f.per === '100 g' ? 'z. B. 1,5 für 150 g' : 'z. B. 0,5 für eine halbe Portion'),
        h('button', { class: 'btn btn-primary btn-block', onclick: () => {
          const fac = parseFloat(factorIn.value.replace(',', '.')) || 1;
          store.update(st => {
            st.meals.push({ id: uid(), date, slot: slotId, name: f.name + (fac !== 1 ? ` ×${fac}` : ''),
              kcal: Math.round(f.kcal * fac), p: Math.round(f.p * fac), c: Math.round(f.c * fac), f: Math.round(f.f * fac) });
            const x = st.foods.find(y => y.id === f.id); if (x) x.lastUsed = Date.now();
          });
          toast(`${f.name} eingetragen`);
          inner.close(); sh.close(); refresh();
        } }, 'Eintragen'),
      ));
    }

    wrap.append(searchIn, list);
    return wrap;
  }

  function freeForm() {
    const nameIn = input({ type: 'text', placeholder: 'z. B. Haferflocken mit Beeren' });
    const kcalIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'kcal' });
    const pIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'g' });
    const cIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'g' });
    const fIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'g' });
    const saveCheck = h('button', { class: 'check', 'aria-label': 'In Datenbank speichern', onclick: () => saveCheck.classList.toggle('on') });

    return h('div', {},
      field('Name', nameIn),
      field('Kalorien', kcalIn),
      h('div', { class: 'input-grid-3' },
        field('Protein', pIn), field('Kohlenh.', cIn), field('Fett', fIn),
      ),
      h('div', { class: 'card-row', style: 'margin:2px 0 16px' },
        saveCheck, h('span', { class: 'small' }, 'Auch in meine Lebensmittel-DB übernehmen'),
      ),
      h('button', { class: 'btn btn-primary btn-block', onclick: () => {
        const name = nameIn.value.trim();
        const kcal = parseFloat(kcalIn.value) || 0;
        if (!name || kcal <= 0) return toast('Name und Kalorien angeben', 'warn');
        const macro = { p: parseFloat(pIn.value) || 0, c: parseFloat(cIn.value) || 0, f: parseFloat(fIn.value) || 0 };
        store.update(st => {
          st.meals.push({ id: uid(), date, slot: slotId, name, kcal, ...macro });
          if (saveCheck.classList.contains('on')) {
            st.foods.push({ id: uid(), name, kcal, ...macro, per: 'Portion', fav: false, lastUsed: Date.now() });
          }
        });
        toast('Eingetragen'); sh.close(); refresh();
      } }, 'Eintragen'),
    );
  }

  paint();
}

// ---------- Lebensmittel-DB verwalten ----------

function foodDbSheet() {
  const body = h('div', {});
  const sh = sheet('Meine Lebensmittel', body);

  function paint() {
    const s = store.get();
    body.innerHTML = '';
    body.append(
      h('button', { class: 'btn btn-ghost btn-block btn-s', style: 'margin-bottom:12px', onclick: () => editFood(null) },
        icon('plus', 16), 'Neues Lebensmittel / Gericht'),
      s.foods.length
        ? h('div', { class: 'list' }, [...s.foods].sort((a, b) => a.name.localeCompare(b.name)).map(f =>
            h('div', { class: 'row' },
              h('div', { class: 'grow' },
                h('div', { class: 'title' }, f.fav ? `★ ${f.name}` : f.name),
                h('div', { class: 'sub num' }, `${fmtNum(f.kcal)} kcal · P ${fmtNum(f.p)} · K ${fmtNum(f.c)} · F ${fmtNum(f.f)} je ${f.per}`),
              ),
              h('button', { class: 'icon-btn', 'aria-label': 'Bearbeiten', onclick: () => editFood(f) }, icon('edit', 16)),
              h('button', { class: 'icon-btn', 'aria-label': 'Löschen', onclick: () =>
                confirmSheet('Lebensmittel löschen?', `„${f.name}" wird aus deiner Datenbank entfernt. Bereits eingetragene Mahlzeiten bleiben erhalten.`, 'Löschen', () => {
                  store.update(st => { st.foods = st.foods.filter(x => x.id !== f.id); });
                  paint();
                }) }, icon('trash', 16)),
            )))
        : emptyState('book', 'Noch leer', 'Lebensmittel, die du hier anlegst, kannst du beim Eintragen mit einem Tipp wiederverwenden.'),
    );
  }

  function editFood(f) {
    const nameIn = input({ type: 'text', value: f?.name || '', placeholder: 'z. B. Magerquark 500 g' });
    const kcalIn = input({ type: 'number', inputmode: 'numeric', value: f?.kcal ?? '' });
    const pIn = input({ type: 'number', inputmode: 'numeric', value: f?.p ?? '' });
    const cIn = input({ type: 'number', inputmode: 'numeric', value: f?.c ?? '' });
    const fIn = input({ type: 'number', inputmode: 'numeric', value: f?.f ?? '' });
    let per = f?.per || 'Portion';

    const inner = sheet(f ? 'Bearbeiten' : 'Neues Lebensmittel', h('div', {},
      field('Name', nameIn),
      segment([{ label: 'pro Portion', value: 'Portion' }, { label: 'pro 100 g', value: '100 g' }], per, v => { per = v; }),
      field('Kalorien', kcalIn),
      h('div', { class: 'input-grid-3' },
        field('Protein (g)', pIn), field('Kohlenh. (g)', cIn), field('Fett (g)', fIn),
      ),
      h('button', { class: 'btn btn-primary btn-block', onclick: () => {
        const name = nameIn.value.trim();
        if (!name) return toast('Name fehlt', 'warn');
        const data = { name, per, kcal: parseFloat(kcalIn.value) || 0, p: parseFloat(pIn.value) || 0, c: parseFloat(cIn.value) || 0, f: parseFloat(fIn.value) || 0 };
        store.update(st => {
          if (f) Object.assign(st.foods.find(x => x.id === f.id), data);
          else st.foods.push({ id: uid(), ...data, fav: false, lastUsed: 0 });
        });
        inner.close(); paint();
      } }, 'Speichern'),
    ));
  }

  paint();
}
