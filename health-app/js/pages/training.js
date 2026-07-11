// Training: Übungs-DB, Workout-Vorlagen (Sätze×Wdh.×Gewicht),
// Live-Logging mit Abhaken, Verlauf pro Übung, Cardio und Trainingsplanung.

import { store, uid, todayKey, fmtNum, fmtDate, relDay, plannedFor } from '../store.js';
import { h, icon, sheet, toast, input, field, segment, emptyState, confirmSheet, lineChart } from '../ui.js';
import { refresh } from '../app.js';

const BASE_EXERCISES = [
  ['Bankdrücken', 'Brust'], ['Schrägbankdrücken', 'Brust'], ['Fliegende', 'Brust'], ['Dips', 'Brust'],
  ['Kniebeugen', 'Beine'], ['Beinpresse', 'Beine'], ['Ausfallschritte', 'Beine'], ['Beinstrecker', 'Beine'], ['Beincurls', 'Beine'], ['Wadenheben', 'Beine'],
  ['Kreuzheben', 'Rücken'], ['Klimmzüge', 'Rücken'], ['Latzug', 'Rücken'], ['Rudern (Langhantel)', 'Rücken'], ['Rudern (Kabel)', 'Rücken'],
  ['Schulterdrücken', 'Schultern'], ['Seitheben', 'Schultern'], ['Face Pulls', 'Schultern'],
  ['Bizeps-Curls', 'Arme'], ['Hammer-Curls', 'Arme'], ['Trizepsdrücken', 'Arme'], ['French Press', 'Arme'],
  ['Crunches', 'Core'], ['Plank', 'Core'], ['Beinheben', 'Core'],
];

const WEEKDAYS = [
  { id: 1, label: 'Mo' }, { id: 2, label: 'Di' }, { id: 3, label: 'Mi' }, { id: 4, label: 'Do' },
  { id: 5, label: 'Fr' }, { id: 6, label: 'Sa' }, { id: 0, label: 'So' },
];

const KINDS = ['Kraft', 'Push', 'Pull', 'Beine', 'Oberkörper', 'Ganzkörper', 'Cardio', 'Mobility'];

function ensureBaseExercises() {
  const s = store.get();
  if (!s.exercises.length) {
    store.update(st => {
      st.exercises = BASE_EXERCISES.map(([name, muscle]) => ({ id: uid() + name.slice(0, 3), name, muscle, custom: false }));
    });
  }
}

let tab = 'heute';

export default {
  title: 'Training',
  render(el) {
    ensureBaseExercises();
    const s = store.get();

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Training'),
          h('div', { class: 'sub' }, `${s.workouts.length ? s.workouts.length + ' Einheiten geloggt' : 'Stärker als gestern'}`),
        ),
      ),
      segment([
        { label: 'Heute', value: 'heute' }, { label: 'Vorlagen', value: 'vorlagen' },
        { label: 'Planung', value: 'planung' }, { label: 'Verlauf', value: 'verlauf' },
      ], tab, v => { tab = v; refresh(); }),
    );

    if (tab === 'heute') renderToday(el);
    if (tab === 'vorlagen') renderTemplates(el);
    if (tab === 'planung') renderPlanning(el);
    if (tab === 'verlauf') renderHistory(el);
  },
};

/* ============================ HEUTE ============================ */

function renderToday(el) {
  const s = store.get();
  const today = todayKey();

  // Aktives Workout
  if (s.activeWorkout) {
    el.append(activeWorkoutCard());
    return;
  }

  // Heute geplant?
  const planned = plannedFor(today);
  if (planned.length) {
    planned.forEach(p => {
      el.append(h('div', { class: 'hero-card card' },
        h('div', { class: 'eyebrow' }, 'Heute geplant' + (p.time ? ` · ${p.time} Uhr` : '')),
        h('div', { style: 'font-size:21px;font-weight:800;margin:4px 0 2px' }, p.template.name),
        h('div', { style: 'opacity:.85;font-size:13.5px' },
          `${p.template.kind || 'Training'} · ${p.template.items.length} Übungen · ${p.template.items.reduce((a, it) => a + it.sets.length, 0)} Sätze`),
        h('button', { class: 'btn btn-block', style: 'margin-top:14px;background:var(--surface);color:var(--ink)', onclick: () => startWorkout(p.template) },
          icon('play', 18), 'Workout starten'),
      ));
    });
  } else {
    el.append(h('div', { class: 'card', style: 'text-align:center' },
      h('div', { class: 'empty-icon', style: 'margin-bottom:10px' }, icon('dumbbell', 28)),
      h('h3', { style: 'font-size:16px' }, 'Heute ist kein Training geplant'),
      h('p', { class: 'small muted', style: 'margin:4px 0 14px' }, 'Starte spontan eine Vorlage oder plane deine Woche.'),
      h('div', { class: 'chip-row', style: 'justify-content:center' },
        h('button', { class: 'chip active', onclick: () => { tab = 'vorlagen'; refresh(); } }, 'Vorlage starten'),
        h('button', { class: 'chip', onclick: () => { tab = 'planung'; refresh(); } }, 'Training planen'),
      ),
    ));
  }

  // Cardio-Schnelleintrag
  el.append(
    h('div', { class: 'section-title' }, h('h2', {}, 'Cardio eintragen')),
    cardioCard(),
  );

  // Heutige Einheiten
  const todays = s.workouts.filter(w => w.date === today);
  if (todays.length) {
    el.append(h('div', { class: 'section-title' }, h('h2', {}, 'Heute absolviert')));
    el.append(h('div', { class: 'list' }, todays.map(w => workoutRow(w))));
  }
}

function cardioCard() {
  const kindIn = input({ type: 'text', placeholder: 'z. B. Laufen, Rad, Rudern' });
  const minIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'Min.' });
  const kmIn = input({ type: 'number', inputmode: 'decimal', step: '0.1', placeholder: 'km (optional)' });
  return h('div', { class: 'card' },
    field('Aktivität', kindIn),
    h('div', { class: 'input-grid' }, field('Dauer', minIn), field('Distanz', kmIn)),
    h('button', { class: 'btn btn-ghost btn-block btn-s', onclick: () => {
      const kind = kindIn.value.trim();
      const min = parseInt(minIn.value, 10);
      if (!kind || !Number.isFinite(min) || min <= 0) return toast('Aktivität und Dauer angeben', 'warn');
      store.update(st => st.workouts.push({
        id: uid(), date: todayKey(), name: kind, durationMin: min, items: [],
        cardio: { kind, min, km: parseFloat(kmIn.value.replace(',', '.')) || null },
      }));
      toast('Cardio gespeichert'); refresh();
    } }, icon('plus', 16), 'Cardio speichern'),
  );
}

/* ============================ AKTIVES WORKOUT ============================ */

function startWorkout(template) {
  store.update(s => {
    s.activeWorkout = {
      startedAt: Date.now(),
      templateId: template?.id || null,
      name: template?.name || 'Freies Training',
      items: (template?.items || []).map(it => ({
        exerciseId: it.exerciseId,
        sets: it.sets.map(set => ({ reps: set.reps, kg: set.kg, done: false })),
      })),
    };
  });
  tab = 'heute';
  refresh();
}

function activeWorkoutCard() {
  const s = store.get();
  const aw = s.activeWorkout;
  const exName = id => s.exercises.find(e => e.id === id)?.name || 'Übung';
  const mins = Math.max(1, Math.round((Date.now() - aw.startedAt) / 60000));
  const totalSets = aw.items.reduce((a, it) => a + it.sets.length, 0);
  const doneSets = aw.items.reduce((a, it) => a + it.sets.filter(x => x.done).length, 0);

  const wrap = h('div', {},
    h('div', { class: 'hero-card card' },
      h('div', { class: 'card-row', style: 'justify-content:space-between' },
        h('div', {},
          h('div', { class: 'eyebrow' }, 'Läuft gerade'),
          h('div', { style: 'font-size:21px;font-weight:800' }, aw.name),
        ),
        h('div', { style: 'text-align:right' },
          h('div', { class: 'num', style: 'font-size:21px;font-weight:800' }, `${doneSets}/${totalSets}`),
          h('div', { style: 'opacity:.8;font-size:12px' }, `Sätze · seit ${mins} Min.`),
        ),
      ),
    ),
  );

  aw.items.forEach((it, itemIdx) => {
    wrap.append(h('div', { class: 'card' },
      h('div', { class: 'card-row', style: 'margin-bottom:10px' },
        h('div', { class: 'title', style: 'font-weight:700;flex:1' }, exName(it.exerciseId)),
        h('button', { class: 'link small', onclick: () => {
          store.update(st => { st.activeWorkout.items[itemIdx].sets.push({ reps: 10, kg: 0, done: false }); });
          refresh();
        } }, '+ Satz'),
      ),
      h('div', { style: 'display:flex;flex-direction:column;gap:8px' },
        h('div', { class: 'set-row small muted', style: 'font-weight:600' },
          h('span', { style: 'text-align:center' }, '#'), h('span', {}, 'Wdh.'), h('span', {}, 'kg'), h('span', {}, '')),
        ...it.sets.map((set, setIdx) => {
          const repsIn = input({ type: 'number', inputmode: 'numeric', value: set.reps ?? '', onchange: e => {
            store.update(st => { st.activeWorkout.items[itemIdx].sets[setIdx].reps = parseInt(e.target.value, 10) || 0; });
          } });
          const kgIn = input({ type: 'number', inputmode: 'decimal', step: '0.5', value: set.kg ?? '', onchange: e => {
            store.update(st => { st.activeWorkout.items[itemIdx].sets[setIdx].kg = parseFloat(e.target.value.replace(',', '.')) || 0; });
          } });
          return h('div', { class: 'set-row' },
            h('span', { class: 'set-no' }, String(setIdx + 1)),
            repsIn, kgIn,
            h('button', {
              class: 'check' + (set.done ? ' on' : ''), style: '--check-c:var(--c-train)', 'aria-label': 'Satz abhaken',
              onclick: () => {
                store.update(st => {
                  const target = st.activeWorkout.items[itemIdx].sets[setIdx];
                  target.done = !target.done;
                  target.reps = parseInt(repsIn.value, 10) || 0;
                  target.kg = parseFloat(kgIn.value.replace(',', '.')) || 0;
                });
                refresh();
              },
            }, icon('check', 15)),
          );
        }),
      ),
    ));
  });

  wrap.append(
    h('button', { class: 'btn btn-ghost btn-block', style: 'margin-bottom:8px', onclick: () => addExercisePicker(list => {
      store.update(st => {
        list.forEach(exId => st.activeWorkout.items.push({ exerciseId: exId, sets: [{ reps: 10, kg: 0, done: false }, { reps: 10, kg: 0, done: false }, { reps: 10, kg: 0, done: false }] }));
      });
      refresh();
    }) }, icon('plus', 17), 'Übung hinzufügen'),
    h('button', { class: 'btn btn-primary btn-block', onclick: finishWorkout }, icon('check', 18), 'Workout abschließen'),
    h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px;color:var(--danger)', onclick: () =>
      confirmSheet('Workout verwerfen?', 'Alle Eingaben dieses Workouts gehen verloren.', 'Verwerfen', () => {
        store.update(st => { st.activeWorkout = null; });
        refresh();
      }) }, 'Verwerfen'),
  );
  return wrap;
}

function finishWorkout() {
  const s = store.get();
  const aw = s.activeWorkout;
  const doneSets = aw.items.reduce((a, it) => a + it.sets.filter(x => x.done).length, 0);
  if (!doneSets) return toast('Hak mindestens einen Satz ab', 'warn');
  store.update(st => {
    st.workouts.push({
      id: uid(), date: todayKey(), name: aw.name, templateId: aw.templateId,
      durationMin: Math.max(1, Math.round((Date.now() - aw.startedAt) / 60000)),
      items: aw.items.map(it => ({ exerciseId: it.exerciseId, sets: it.sets.filter(x => x.done) })),
    });
    st.activeWorkout = null;
  });
  toast('Workout gespeichert – stark! 💪');
  refresh();
}

/* ============================ VORLAGEN ============================ */

function renderTemplates(el) {
  const s = store.get();
  el.append(
    h('button', { class: 'btn btn-primary btn-block', style: 'margin-bottom:12px', onclick: () => editTemplate(null) },
      icon('plus', 17), 'Neue Vorlage erstellen'),
  );
  if (!s.templates.length) {
    el.append(emptyState('note', 'Noch keine Vorlagen',
      'Eine Vorlage ist dein wiederverwendbarer Trainingsplan – z. B. „Push Day" mit allen Übungen, Sätzen und Gewichten.'));
    return;
  }
  el.append(h('div', { class: 'list' }, s.templates.map(t => {
    const sets = t.items.reduce((a, it) => a + it.sets.length, 0);
    return h('div', { class: 'row' },
      h('div', { class: 'module-ic', style: '--mc:var(--c-train)' }, icon('dumbbell', 20)),
      h('div', { class: 'grow', onclick: () => editTemplate(t) },
        h('div', { class: 'title' }, t.name),
        h('div', { class: 'sub' }, `${t.kind || 'Kraft'} · ${t.items.length} Übungen · ${sets} Sätze`),
      ),
      h('button', { class: 'icon-btn accent', 'aria-label': 'Starten', onclick: () => startWorkout(t) }, icon('play', 18)),
    );
  })));
}

function editTemplate(t) {
  const isNew = !t;
  const draft = t
    ? JSON.parse(JSON.stringify(t))
    : { id: uid(), name: '', kind: 'Kraft', items: [] };

  const s = store.get();
  const exName = id => s.exercises.find(e => e.id === id)?.name || 'Übung';
  const body = h('div', {});
  const sh = sheet(isNew ? 'Neue Vorlage' : 'Vorlage bearbeiten', body);

  function paint() {
    body.innerHTML = '';
    const nameIn = input({ type: 'text', value: draft.name, placeholder: 'z. B. Push Day', onchange: e => { draft.name = e.target.value; } });
    const kindChips = h('div', { class: 'chip-row', style: 'margin-bottom:14px' },
      KINDS.map(k => {
        const b = h('button', { class: 'chip' + (draft.kind === k ? ' active' : ''), onclick: () => { draft.kind = k; paint(); } }, k);
        return b;
      }));

    body.append(
      field('Name', nameIn),
      h('div', { class: 'field-label', style: 'margin-bottom:6px' }, 'Trainingsart'),
      kindChips,
      h('div', { class: 'field-label', style: 'margin-bottom:6px' }, 'Übungen'),
      ...draft.items.map((it, idx) => h('div', { class: 'row', style: 'margin-bottom:8px' },
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, exName(it.exerciseId)),
          h('div', { class: 'sub num' }, it.sets.map(x => `${x.reps}×${fmtNum(x.kg)}kg`).join(' · ')),
        ),
        h('button', { class: 'icon-btn', 'aria-label': 'Sätze bearbeiten', onclick: () => editSets(it) }, icon('edit', 16)),
        h('button', { class: 'icon-btn', 'aria-label': 'Übung entfernen', onclick: () => { draft.items.splice(idx, 1); paint(); } }, icon('x', 16)),
      )),
      h('button', { class: 'btn btn-ghost btn-block btn-s', style: 'margin:4px 0 14px', onclick: () =>
        addExercisePicker(list => {
          list.forEach(exId => draft.items.push({ exerciseId: exId, sets: [{ reps: 10, kg: 20 }, { reps: 10, kg: 20 }, { reps: 10, kg: 20 }] }));
          paint();
        }) }, icon('plus', 16), 'Übungen hinzufügen'),
      h('button', { class: 'btn btn-primary btn-block', onclick: () => {
        if (!draft.name.trim()) return toast('Name fehlt', 'warn');
        if (!draft.items.length) return toast('Mindestens eine Übung', 'warn');
        store.update(st => {
          const i = st.templates.findIndex(x => x.id === draft.id);
          if (i >= 0) st.templates[i] = draft; else st.templates.push(draft);
        });
        sh.close(); refresh();
      } }, 'Vorlage speichern'),
      !isNew ? h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px;color:var(--danger)', onclick: () =>
        confirmSheet('Vorlage löschen?', `„${draft.name}" und zugehörige Planungen werden entfernt.`, 'Löschen', () => {
          store.update(st => {
            st.templates = st.templates.filter(x => x.id !== draft.id);
            st.planned = st.planned.filter(p => p.templateId !== draft.id);
          });
          sh.close(); refresh();
        }) }, 'Vorlage löschen') : null,
    );
  }

  function editSets(item) {
    const inner = h('div', {});
    const innerSheet = sheet(`Sätze: ${exName(item.exerciseId)}`, inner);
    function paintSets() {
      inner.innerHTML = '';
      inner.append(
        h('div', { class: 'set-row small muted', style: 'font-weight:600;margin-bottom:6px' },
          h('span', { style: 'text-align:center' }, '#'), h('span', {}, 'Wdh.'), h('span', {}, 'kg'), h('span', {}, '')),
        ...item.sets.map((set, i) => h('div', { class: 'set-row', style: 'margin-bottom:8px' },
          h('span', { class: 'set-no' }, String(i + 1)),
          input({ type: 'number', inputmode: 'numeric', value: set.reps, onchange: e => { set.reps = parseInt(e.target.value, 10) || 0; } }),
          input({ type: 'number', inputmode: 'decimal', step: '0.5', value: set.kg, onchange: e => { set.kg = parseFloat(e.target.value.replace(',', '.')) || 0; } }),
          h('button', { class: 'icon-btn', 'aria-label': 'Satz entfernen', onclick: () => { item.sets.splice(i, 1); paintSets(); } }, icon('x', 15)),
        )),
        h('button', { class: 'btn btn-ghost btn-block btn-s', style: 'margin-bottom:10px', onclick: () => {
          const last = item.sets[item.sets.length - 1] || { reps: 10, kg: 20 };
          item.sets.push({ reps: last.reps, kg: last.kg });
          paintSets();
        } }, '+ Satz'),
        h('button', { class: 'btn btn-primary btn-block', onclick: () => { innerSheet.close(); paint(); } }, 'Fertig'),
      );
    }
    paintSets();
  }

  paint();
}

/* ============================ ÜBUNGS-PICKER & DB ============================ */

function addExercisePicker(onDone) {
  const s = store.get();
  const selected = new Set();
  const body = h('div', {});
  const sh = sheet('Übungen wählen', body);

  const searchIn = input({ type: 'search', placeholder: 'Übung suchen …', oninput: () => paint(searchIn.value) });

  function paint(q = '') {
    body.innerHTML = '';
    body.append(searchIn);
    const groups = {};
    store.get().exercises
      .filter(e => e.name.toLowerCase().includes(q.toLowerCase()))
      .forEach(e => { (groups[e.muscle || 'Sonstige'] ||= []).push(e); });

    Object.entries(groups).forEach(([muscle, list]) => {
      body.append(h('div', { class: 'eyebrow', style: 'margin:14px 0 8px' }, muscle));
      body.append(h('div', { class: 'list' }, list.map(e => {
        const row = h('div', { class: 'row', onclick: () => {
          selected.has(e.id) ? selected.delete(e.id) : selected.add(e.id);
          row.querySelector('.check').classList.toggle('on');
        } },
          h('span', { class: 'check' + (selected.has(e.id) ? ' on' : ''), style: '--check-c:var(--c-train)' }, icon('check', 15)),
          h('div', { class: 'grow' }, h('div', { class: 'title' }, e.name)),
        );
        return row;
      })));
    });

    body.append(
      h('button', { class: 'btn btn-ghost btn-block btn-s', style: 'margin:14px 0 8px', onclick: newExercise }, icon('plus', 16), 'Eigene Übung anlegen'),
      h('button', { class: 'btn btn-primary btn-block', onclick: () => {
        if (!selected.size) return toast('Nichts ausgewählt', 'warn');
        sh.close(); onDone([...selected]);
      } }, `Übernehmen${selected.size ? ` (${selected.size})` : ''}`),
    );
  }

  function newExercise() {
    const nameIn = input({ type: 'text', placeholder: 'z. B. Bulgarian Split Squats' });
    const muscleIn = input({ type: 'text', placeholder: 'z. B. Beine' });
    const inner = sheet('Eigene Übung', h('div', {},
      field('Name', nameIn), field('Muskelgruppe', muscleIn),
      h('button', { class: 'btn btn-primary btn-block', onclick: () => {
        const name = nameIn.value.trim();
        if (!name) return toast('Name fehlt', 'warn');
        store.update(st => st.exercises.push({ id: uid(), name, muscle: muscleIn.value.trim() || 'Sonstige', custom: true }));
        inner.close(); paint(searchIn.value);
      } }, 'Anlegen'),
    ));
  }

  paint();
}

/* ============================ PLANUNG ============================ */

function renderPlanning(el) {
  const s = store.get();

  el.append(
    h('div', { class: 'notice', style: 'margin-bottom:12px' }, icon('calendar', 18),
      h('span', {}, 'Geplante Trainings erscheinen auf dem Dashboard und im Kalender – von dort startest du sie direkt.')),
    h('button', { class: 'btn btn-primary btn-block', style: 'margin-bottom:12px', onclick: () => planSheet() },
      icon('plus', 17), 'Training planen'),
  );

  if (!s.planned.length) {
    el.append(emptyState('calendar', 'Nichts geplant',
      'Plane eine Vorlage für ein festes Datum oder wiederkehrend – z. B. Push jeden Montag und Donnerstag.'));
    return;
  }

  el.append(h('div', { class: 'list' }, s.planned.map(p => {
    const t = s.templates.find(x => x.id === p.templateId);
    const when = p.date
      ? relDay(p.date)
      : 'Jeden ' + WEEKDAYS.filter(w => (p.weekdays || []).includes(w.id)).map(w => w.label).join(', ');
    return h('div', { class: 'row' },
      h('div', { class: 'module-ic', style: '--mc:var(--c-train)' }, icon('calendar', 20)),
      h('div', { class: 'grow' },
        h('div', { class: 'title' }, t?.name || 'Gelöschte Vorlage'),
        h('div', { class: 'sub' }, when + (p.time ? ` · ${p.time} Uhr` : '')),
      ),
      h('button', { class: 'icon-btn', 'aria-label': 'Planung löschen', onclick: () => {
        store.update(st => { st.planned = st.planned.filter(x => x.id !== p.id); });
        refresh();
      } }, icon('trash', 16)),
    );
  })));

  function planSheet() {
    if (!s.templates.length) {
      toast('Lege zuerst eine Vorlage an', 'warn');
      tab = 'vorlagen'; refresh();
      return;
    }
    let templateId = s.templates[0].id;
    let mode = 'once';
    const weekdaysSel = new Set([1]);
    const dateIn = input({ type: 'date', value: todayKey(), min: todayKey() });
    const timeIn = input({ type: 'time', value: '18:00' });

    const body = h('div', {});
    const sh = sheet('Training planen', body);

    function paint() {
      body.innerHTML = '';
      body.append(
        field('Vorlage', h('select', { class: 'input', onchange: e => { templateId = e.target.value; } },
          s.templates.map(t => h('option', { value: t.id, selected: t.id === templateId }, t.name)))),
        segment([{ label: 'Einmalig', value: 'once' }, { label: 'Wöchentlich', value: 'weekly' }], mode, v => { mode = v; paint(); }),
        mode === 'once'
          ? field('Datum', dateIn)
          : h('div', { class: 'field' },
              h('span', { class: 'field-label' }, 'Wochentage'),
              h('div', { class: 'chip-row' }, WEEKDAYS.map(w => {
                const b = h('button', { class: 'chip' + (weekdaysSel.has(w.id) ? ' active' : ''), onclick: () => {
                  weekdaysSel.has(w.id) ? weekdaysSel.delete(w.id) : weekdaysSel.add(w.id);
                  b.classList.toggle('active');
                } }, w.label);
                return b;
              }))),
        field('Uhrzeit (optional)', timeIn),
        h('button', { class: 'btn btn-primary btn-block', onclick: () => {
          if (mode === 'weekly' && !weekdaysSel.size) return toast('Mindestens einen Wochentag wählen', 'warn');
          store.update(st => st.planned.push({
            id: uid(), templateId,
            date: mode === 'once' ? (dateIn.value || todayKey()) : null,
            weekdays: mode === 'weekly' ? [...weekdaysSel] : null,
            time: timeIn.value || null,
          }));
          toast('Training geplant'); sh.close(); refresh();
        } }, 'Planen'),
      );
    }
    paint();
  }
}

/* ============================ VERLAUF ============================ */

function renderHistory(el) {
  const s = store.get();
  if (!s.workouts.length) {
    el.append(emptyState('chart', 'Noch kein Verlauf', 'Nach deinem ersten Workout siehst du hier alle Einheiten und deine Entwicklung pro Übung.'));
    return;
  }

  // Übungs-Fortschritt
  const exercised = new Map(); // exerciseId -> [{date, best, volume}]
  [...s.workouts].sort((a, b) => a.date.localeCompare(b.date)).forEach(w => {
    (w.items || []).forEach(it => {
      const best = Math.max(0, ...it.sets.map(x => x.kg || 0));
      const vol = it.sets.reduce((a, x) => a + (x.reps || 0) * (x.kg || 0), 0);
      if (!it.sets.length) return;
      (exercised.get(it.exerciseId) || exercised.set(it.exerciseId, []).get(it.exerciseId)).push({ date: w.date, best, vol });
    });
  });

  if (exercised.size) {
    el.append(h('div', { class: 'section-title' }, h('h2', {}, 'Fortschritt pro Übung')));
    const sel = h('select', { class: 'input', onchange: e => paintChart(e.target.value) },
      [...exercised.keys()].map(id => h('option', { value: id }, s.exercises.find(e => e.id === id)?.name || 'Übung')));
    const chartWrap = h('div', {});
    el.append(h('div', { class: 'card' }, sel, h('div', { style: 'margin-top:12px' }, chartWrap)));

    function paintChart(exId) {
      const data = exercised.get(exId) || [];
      chartWrap.innerHTML = '';
      if (data.length < 2) {
        chartWrap.append(h('p', { class: 'small muted', style: 'text-align:center' },
          data.length ? `Bisher 1 Einheit · Bestes Gewicht: ${fmtNum(data[0].best, 1)} kg` : 'Keine Daten'));
        return;
      }
      chartWrap.append(
        lineChart({ data: data.map(d => ({ x: fmtDate(d.date), value: d.best })), color: 'var(--c-train)', formatValue: v => `${fmtNum(v, 1)} kg` }),
        h('div', { class: 'small muted', style: 'text-align:center;margin-top:6px' }, 'Bestes Satz-Gewicht pro Einheit'),
      );
    }
    paintChart([...exercised.keys()][0]);
  }

  el.append(h('div', { class: 'section-title' }, h('h2', {}, 'Alle Einheiten')));
  el.append(h('div', { class: 'list' }, [...s.workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50).map(w => workoutRow(w))));
}

function workoutRow(w) {
  const s = store.get();
  const sets = (w.items || []).reduce((a, it) => a + it.sets.length, 0);
  const vol = (w.items || []).reduce((a, it) => a + it.sets.reduce((b, x) => b + (x.reps || 0) * (x.kg || 0), 0), 0);
  const sub = w.cardio
    ? `${w.cardio.min} Min.${w.cardio.km ? ` · ${fmtNum(w.cardio.km, 1)} km` : ''}`
    : `${sets} Sätze · ${fmtNum(vol)} kg Volumen · ${w.durationMin || '–'} Min.`;
  return h('div', { class: 'row' },
    h('div', { class: 'module-ic', style: '--mc:var(--c-train)' }, icon(w.cardio ? 'heart' : 'dumbbell', 20)),
    h('div', { class: 'grow' },
      h('div', { class: 'title' }, w.name),
      h('div', { class: 'sub num' }, `${relDay(w.date)} · ${sub}`),
    ),
    h('button', { class: 'icon-btn', 'aria-label': 'Löschen', onclick: () =>
      confirmSheet('Einheit löschen?', `„${w.name}" vom ${fmtDate(w.date)} wird entfernt.`, 'Löschen', () => {
        store.update(st => { st.workouts = st.workouts.filter(x => x.id !== w.id); });
        refresh();
      }) }, icon('trash', 16)),
  );
}
