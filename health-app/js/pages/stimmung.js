// Stimmung & Journal: 5er-Emoji-Skala mit Tags, Freitext-Journal,
// Stimmungsverlauf über die Zeit.

import { store, todayKey, lastDays, fmtDate, relDay } from '../store.js';
import { h, lineChart, toast, emptyState } from '../ui.js';
import { refresh, go } from '../app.js';

export const MOODS = [
  { score: 1, emoji: '😞', label: 'Mies' },
  { score: 2, emoji: '😕', label: 'Naja' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Gut' },
  { score: 5, emoji: '😄', label: 'Super' },
];

const TAGS = ['Energie', 'Stress', 'Fokus', 'Familie', 'Arbeit', 'Training', 'Schlecht geschlafen', 'Krank'];

export default {
  title: 'Stimmung',
  render(el) {
    const s = store.get();
    const today = todayKey();
    const rec = s.days[today]?.mood || null;
    const sel = new Set(rec?.tags || []);

    const textIn = h('textarea', { class: 'input', placeholder: 'Wie war dein Tag? (Journal, optional)' });
    if (rec?.text) textIn.value = rec.text;

    let score = rec?.score || 0;

    const scale = h('div', { class: 'mood-scale' }, MOODS.map(m =>
      h('button', {
        class: 'mood-btn' + (score === m.score ? ' active' : ''),
        'aria-label': m.label,
        onclick: e => {
          score = m.score;
          scale.querySelectorAll('.mood-btn').forEach(x => x.classList.remove('active'));
          e.currentTarget.classList.add('active');
        },
      }, m.emoji)));

    const tagChips = h('div', { class: 'chip-row', style: 'margin-top:12px' }, TAGS.map(t => {
      const b = h('button', { class: 'chip' + (sel.has(t) ? ' active' : ''), onclick: () => {
        sel.has(t) ? sel.delete(t) : sel.add(t);
        b.classList.toggle('active');
      } }, t);
      return b;
    }));

    // Verlauf
    const days = lastDays(14);
    const moodData = days
      .map(k => ({ k, m: s.days[k]?.mood }))
      .filter(x => x.m)
      .map(x => ({ x: fmtDate(x.k), value: x.m.score }));

    const journal = Object.entries(s.days)
      .filter(([, d]) => d.mood?.text)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 21);

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Stimmung'),
          h('div', { class: 'sub' }, 'Täglicher Check-in & Journal'),
        ),
      ),

      h('div', { class: 'card' },
        h('div', { class: 'eyebrow', style: 'margin-bottom:10px' }, relDay(today)),
        scale,
        tagChips,
        h('div', { style: 'margin-top:12px' }, textIn),
        h('button', { class: 'btn btn-primary btn-block', style: 'margin-top:12px', onclick: () => {
          if (!score) return toast('Wähle eine Stimmung', 'warn');
          store.update(st => {
            if (!st.days[today]) st.days[today] = {};
            st.days[today].mood = { score, tags: [...sel], text: textIn.value.trim() };
          });
          toast('Check-in gespeichert'); refresh();
        } }, rec ? 'Check-in aktualisieren' : 'Check-in speichern'),
      ),

      h('div', { class: 'section-title' }, h('h2', {}, 'Verlauf (14 Tage)')),
      h('div', { class: 'card' },
        moodData.length >= 2
          ? lineChart({ data: moodData, color: 'var(--c-mood)', height: 140, formatValue: v => MOODS.find(m => m.score === Math.round(v))?.emoji || String(v) })
          : h('p', { class: 'small muted', style: 'text-align:center;padding:8px 0' }, 'Ab zwei Check-ins siehst du hier deinen Stimmungsverlauf.'),
      ),

      h('div', { class: 'section-title' },
        h('h2', {}, 'Journal'),
        h('button', { class: 'link small', onclick: () => go('notizen') }, 'Zu den Notizen'),
      ),
      journal.length
        ? h('div', { class: 'list' }, journal.map(([k, d]) => h('div', { class: 'card pad-s', style: 'margin-bottom:0' },
            h('div', { class: 'card-row', style: 'margin-bottom:6px' },
              h('span', { style: 'font-size:22px' }, MOODS.find(m => m.score === d.mood.score)?.emoji || '📝'),
              h('div', { class: 'grow' },
                h('div', { style: 'font-weight:700;font-size:14px' }, relDay(k)),
                d.mood.tags?.length ? h('div', { class: 'small muted' }, d.mood.tags.join(' · ')) : null,
              ),
            ),
            h('p', { class: 'small', style: 'white-space:pre-wrap' }, d.mood.text),
          )))
        : emptyState('note', 'Noch keine Journal-Einträge', 'Schreib beim Check-in ein paar Zeilen – hier entsteht dein Tagebuch.'),
    );
  },
};
