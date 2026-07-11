// Dashboard: Tagesüberblick mit Aktivitätsringen, geplantem Training,
// Wetter, "Heute fällig", Streaks, Wochen-Strip und Schnellzugriffen.

import { store, todayKey, fmtNum, fmtDate, relDay, kcalOf, waterOf, stepsOf, latestWeight, weekKeys, workoutsOf, plannedFor, nextPlanned, remindersFor, keyToDate } from '../store.js';
import { h, icon, ring, toast } from '../ui.js';
import { refresh, go } from '../app.js';
import { activeStreaks } from '../goals.js';
import { getWeather, wmoInfo } from '../weather.js';
import { MOODS } from './stimmung.js';

export default {
  title: 'Dashboard',
  render(el) {
    const s = store.get();
    const today = todayKey();
    const hour = new Date().getHours();
    const greeting = hour < 5 ? 'Gute Nacht' : hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend';
    const name = s.settings.name ? `, ${s.settings.name}` : '';

    const sum = kcalOf(today);
    const water = waterOf(today);
    const steps = stepsOf(today);
    const g = s.goals;

    // ---------- Kopf ----------
    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('div', { class: 'eyebrow' }, fmtDate(today, 'long')),
          h('h1', { class: 'page-title' }, `${greeting}${name}`),
        ),
        h('button', { class: 'icon-btn', 'aria-label': 'Einstellungen', onclick: () => go('einstellungen') }, icon('gear')),
      ),
    );

    // ---------- Streaks ----------
    const streaks = activeStreaks();
    if (streaks.length) {
      el.append(h('div', { class: 'streak-row', style: 'margin-bottom:12px' },
        streaks.map(st => h('button', { class: 'streak-pill', style: `--mc:${st.color}`, onclick: () => go('ziele') },
          icon('flame', 16), `${st.label}: ${st.days} ${st.days === 1 ? 'Tag' : 'Tage'}`)),
      ));
    }

    // ---------- Aktivitätsringe ----------
    el.append(h('div', { class: 'card' },
      h('div', { class: 'rings-row' },
        ringBtn('kalorien', ring({ size: 92, stroke: 10, value: sum.kcal, max: g.kcal, color: 'var(--c-kcal)', overflowColor: 'var(--danger)', label: fmtNum(sum.kcal), sub: 'kcal' })),
        ringBtn('wasser', ring({ size: 92, stroke: 10, value: water, max: g.waterMl, color: 'var(--c-water)', label: (water / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 }), sub: 'Liter' })),
        ringBtn('schritte', ring({ size: 92, stroke: 10, value: steps, max: g.steps, color: 'var(--c-steps)', label: steps >= 10000 ? `${(steps / 1000).toFixed(1)}k` : fmtNum(steps), sub: 'Schritte' })),
      ),
    ));

    // ---------- Geplantes Training ----------
    el.append(trainingWidget());

    // ---------- Wetter + Gewicht ----------
    el.append(h('div', { class: 'dash-grid', style: 'margin-bottom:12px' },
      weatherWidget(),
      weightWidget(),
      fastingWidget(),
      moodWidget(),
    ));

    // ---------- Heute fällig ----------
    const due = [
      ...remindersFor(today).map(r => ({ kind: 'reminder', title: r.title, sub: r.time ? `${r.time} Uhr · Erinnerung` : 'Erinnerung', color: 'var(--c-note)', icon: 'bell', route: 'erinnerungen' })),
      ...s.tasks.filter(t => !t.done && t.due && t.due <= today).map(t => ({
        kind: 'task', id: t.id, title: t.title,
        sub: (t.due < today ? 'überfällig' : 'Aufgabe') + (t.assignee && t.assignee !== 'Ich' ? ` · ${t.assignee}` : ''),
        color: t.due < today ? 'var(--danger)' : 'var(--c-task)', icon: 'checks', route: 'aufgaben',
      })),
    ];
    if (due.length) {
      el.append(h('div', { class: 'section-title' },
        h('h2', {}, 'Heute fällig'),
        h('span', { class: 'badge tint', style: '--badge-c:var(--accent)' }, String(due.length))));
      el.append(h('div', { class: 'list', style: 'margin-bottom:12px' }, due.slice(0, 5).map(d =>
        h('div', { class: 'row' },
          d.kind === 'task'
            ? h('button', { class: 'check', style: `--check-c:${d.color}`, 'aria-label': 'Abhaken', onclick: () => {
                store.update(st => { const x = st.tasks.find(y => y.id === d.id); if (x) { x.done = true; x.doneAt = Date.now(); } });
                toast('Erledigt'); refresh();
              } }, icon('check', 16))
            : h('div', { class: 'module-ic', style: `--mc:${d.color};width:32px;height:32px;border-radius:10px` }, icon(d.icon, 17)),
          h('div', { class: 'grow', onclick: () => go(d.route) },
            h('div', { class: 'title' }, d.title),
            h('div', { class: 'sub' }, d.sub),
          ),
        ))));
    }

    // ---------- Wochen-Strip ----------
    const week = weekKeys();
    el.append(
      h('div', { class: 'section-title' },
        h('h2', {}, 'Deine Woche'),
        h('button', { class: 'link small', onclick: () => go('report') }, 'Zum Report')),
      h('button', { class: 'week-strip', style: 'width:100%;margin-bottom:12px', onclick: () => go('kalender') },
        week.map(k => h('div', { class: 'week-day' + (k === today ? ' today' : '') },
          h('span', { class: 'wd' }, fmtDate(k, 'wd')),
          h('span', { class: 'dn' }, String(keyToDate(k).getDate())),
          h('i', { class: 'dot' + ((workoutsOf(k).length || plannedFor(k).length) ? ' on' : '') }),
        ))),
    );

    // ---------- Supplemente kompakt ----------
    el.append(suppWidget());

    /* ================= Widgets ================= */

    function ringBtn(route, ringEl) {
      return h('button', { style: 'background:none', onclick: () => go(route) }, ringEl);
    }

    function trainingWidget() {
      const next = nextPlanned();
      const doneToday = workoutsOf(today);

      if (s.activeWorkout) {
        return h('button', { class: 'card hero-card clickable', style: 'width:100%;text-align:left', onclick: () => go('training') },
          h('div', { class: 'eyebrow' }, 'Workout läuft'),
          h('div', { style: 'font-size:19px;font-weight:800;margin-top:2px' }, s.activeWorkout.name),
          h('div', { style: 'opacity:.85;font-size:13px;margin-top:2px' }, 'Tippen, um weiterzumachen'),
        );
      }

      if (doneToday.length && (!next || next.date !== today)) {
        return h('button', { class: 'card clickable', style: 'width:100%;text-align:left', onclick: () => go('training') },
          h('div', { class: 'card-row' },
            h('div', { class: 'module-ic', style: '--mc:var(--c-train)' }, icon('check', 20)),
            h('div', { class: 'grow' },
              h('div', { class: 'title', style: 'font-weight:700' }, `${doneToday[0].name} absolviert`),
              h('div', { class: 'sub' }, 'Training für heute im Kasten – stark!'),
            ),
            icon('chevR', 18),
          ));
      }

      if (!next) {
        return h('button', { class: 'card clickable', style: 'width:100%;text-align:left', onclick: () => go('training') },
          h('div', { class: 'card-row' },
            h('div', { class: 'module-ic', style: '--mc:var(--c-train)' }, icon('dumbbell', 20)),
            h('div', { class: 'grow' },
              h('div', { class: 'title', style: 'font-weight:700' }, 'Kein Training geplant'),
              h('div', { class: 'sub' }, 'Tippe hier, um deine Woche zu planen'),
            ),
            icon('chevR', 18),
          ));
      }

      const t = next.plan.template;
      const isToday = next.date === today;
      return h('div', { class: 'card' + (isToday ? ' hero-card' : '') },
        h('div', { class: 'card-row', style: 'justify-content:space-between' },
          h('div', {},
            h('div', { class: 'eyebrow' }, isToday ? `Heute geplant${next.plan.time ? ` · ${next.plan.time} Uhr` : ''}` : `Nächstes Training · ${relDay(next.date)}`),
            h('div', { style: 'font-size:19px;font-weight:800;margin-top:2px' }, t.name),
            h('div', { style: `font-size:13px;margin-top:2px;${isToday ? 'opacity:.85' : ''}`, class: isToday ? '' : 'muted' },
              `${t.kind || 'Training'} · ${t.items.length} Übungen · ${t.items.reduce((a, it) => a + it.sets.length, 0)} Sätze`),
          ),
          isToday
            ? h('button', { class: 'btn btn-s', style: 'background:var(--surface);color:var(--ink);flex:none', onclick: () => go('training') }, icon('play', 16), 'Start')
            : h('button', { class: 'icon-btn', 'aria-label': 'Zum Training', onclick: () => go('training') }, icon('chevR', 18)),
        ),
      );
    }

    function weatherWidget() {
      const cache = s.weatherCache;
      const card = h('button', { class: 'card pad-s clickable', style: 'text-align:left', onclick: () => go('wetter') });
      if (!cache) {
        card.append(
          h('div', { class: 'eyebrow', style: 'margin-bottom:6px' }, 'Wetter'),
          h('div', { class: 'small muted' }, 'Tippen zum Laden'),
        );
        // still leise im Hintergrund versuchen
        getWeather().then(() => refresh()).catch(() => {});
      } else {
        const cur = cache.data.current;
        const [desc, ic] = wmoInfo(cur.weather_code);
        const max = cache.data.daily.temperature_2m_max[0];
        const min = cache.data.daily.temperature_2m_min[0];
        card.append(
          h('div', { class: 'card-row', style: 'justify-content:space-between' },
            h('div', { class: 'eyebrow' }, cache.place?.name?.split(',')[0] || 'Wetter'),
            icon(ic, 20),
          ),
          h('div', { class: 'stat-big', style: 'margin-top:4px' }, `${Math.round(cur.temperature_2m)}°`),
          h('div', { class: 'small muted' }, `${desc} · ${Math.round(max)}°/${Math.round(min)}°`),
        );
      }
      return card;
    }

    function weightWidget() {
      const latest = latestWeight();
      const prev = [...s.weights].sort((a, b) => a.date.localeCompare(b.date)).slice(-2)[0];
      const delta = latest && prev && prev.id !== latest.id ? latest.kg - prev.kg : null;
      return h('button', { class: 'card pad-s clickable', style: 'text-align:left', onclick: () => go('gewicht') },
        h('div', { class: 'card-row', style: 'justify-content:space-between' },
          h('div', { class: 'eyebrow' }, 'Gewicht'),
          icon('scale', 20),
        ),
        latest
          ? h('div', {},
              h('div', { class: 'stat-big', style: 'margin-top:4px' }, fmtNum(latest.kg, 1), h('small', {}, ' kg')),
              h('div', { class: 'small muted' }, delta === null ? relDay(latest.date) : `${delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : ''}${fmtNum(delta, 1)} kg · ${relDay(latest.date)}`))
          : h('div', { class: 'small muted', style: 'margin-top:6px' }, 'Noch keine Messung'),
      );
    }

    function fastingWidget() {
      const af = s.activeFast;
      if (!af) {
        return h('button', { class: 'card pad-s clickable', style: 'text-align:left', onclick: () => go('fasten') },
          h('div', { class: 'card-row', style: 'justify-content:space-between' },
            h('div', { class: 'eyebrow' }, 'Fasten'),
            icon('timer', 20)),
          h('div', { class: 'small muted', style: 'margin-top:6px' }, 'Kein Fasten aktiv'),
        );
      }
      const elapsed = Date.now() - af.start;
      const target = af.targetH * 3600000;
      const pct = Math.min(100, Math.round((elapsed / target) * 100));
      const hh = Math.floor(elapsed / 3600000), mm = Math.floor((elapsed % 3600000) / 60000);
      return h('button', { class: 'card pad-s clickable', style: 'text-align:left', onclick: () => go('fasten') },
        h('div', { class: 'card-row', style: 'justify-content:space-between' },
          h('div', { class: 'eyebrow' }, 'Fasten läuft'),
          icon('timer', 20)),
        h('div', { class: 'stat-big', style: 'margin-top:4px' }, `${hh}:${String(mm).padStart(2, '0')}`, h('small', {}, ' h')),
        h('div', { class: 'pbar', style: 'margin-top:8px' }, h('div', { class: 'pbar-fill', style: `width:${pct}%;background:var(--c-fast)` })),
      );
    }

    function moodWidget() {
      const rec = s.days[today]?.mood;
      return h('button', { class: 'card pad-s clickable', style: 'text-align:left', onclick: () => go('stimmung') },
        h('div', { class: 'card-row', style: 'justify-content:space-between' },
          h('div', { class: 'eyebrow' }, 'Stimmung'),
          icon('smile', 20)),
        rec
          ? h('div', { class: 'card-row', style: 'margin-top:4px' },
              h('span', { style: 'font-size:30px' }, MOODS.find(m => m.score === rec.score)?.emoji || '🙂'),
              h('span', { class: 'small muted' }, MOODS.find(m => m.score === rec.score)?.label || ''))
          : h('div', { class: 'small muted', style: 'margin-top:6px' }, 'Wie geht’s dir heute? Check-in machen'),
      );
    }

    function suppWidget() {
      if (!s.supplements.length) return h('div', {});
      const taken = s.days[today]?.supps || {};
      const total = s.supplements.reduce((a, sup) => a + (sup.times?.length || 0), 0);
      const done = s.supplements.reduce((a, sup) => a + (sup.times || []).filter(t => taken[sup.id]?.[t]).length, 0);
      const open = s.supplements
        .flatMap(sup => (sup.times || []).filter(t => !taken[sup.id]?.[t]).map(t => ({ sup, t })))
        .slice(0, 3);
      return h('div', {},
        h('div', { class: 'section-title' },
          h('h2', {}, 'Supplemente'),
          h('button', { class: 'link small', onclick: () => go('supplemente') }, `${done}/${total}`)),
        done >= total
          ? h('div', { class: 'card pad-s card-row' },
              h('div', { class: 'module-ic', style: '--mc:var(--c-supp)' }, icon('check', 20)),
              h('div', { class: 'grow title', style: 'font-weight:700' }, 'Alle Supplemente genommen'))
          : h('div', { class: 'list' }, open.map(({ sup, t }) => h('div', { class: 'row' },
              h('button', { class: 'check', style: '--check-c:var(--c-supp)', 'aria-label': 'Abhaken', onclick: () => {
                store.update(st => {
                  if (!st.days[today]) st.days[today] = {};
                  if (!st.days[today].supps) st.days[today].supps = {};
                  if (!st.days[today].supps[sup.id]) st.days[today].supps[sup.id] = {};
                  st.days[today].supps[sup.id][t] = true;
                });
                refresh();
              } }, icon('check', 16)),
              h('div', { class: 'grow' },
                h('div', { class: 'title' }, sup.name),
                h('div', { class: 'sub' }, `${t[0].toUpperCase() + t.slice(1)}${sup.dose ? ' · ' + sup.dose : ''}`)),
            ))),
      );
    }
  },
};
