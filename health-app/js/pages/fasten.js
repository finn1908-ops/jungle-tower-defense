// Intervallfasten: Timer mit Fortschrittsring, Presets (16:8, 18:6, 20:4),
// Fasten-Historie – verlinkt mit dem Kalorientracker.

import { store, uid, fmtDate, fmtNum } from '../store.js';
import { h, icon, ring, toast, input, field, emptyState, confirmSheet } from '../ui.js';
import { refresh, go } from '../app.js';

const PRESETS = [16, 18, 20];

const fmtDur = ms => {
  const totalMin = Math.floor(ms / 60000);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${hh}:${String(mm).padStart(2, '0')} h`;
};

let ticker = null;

export default {
  title: 'Fasten',
  render(el) {
    clearInterval(ticker);
    const s = store.get();
    const af = s.activeFast;

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Fasten'),
          h('div', { class: 'sub' }, af ? `Fenster: ${af.targetH}:${24 - af.targetH}` : 'Intervallfasten-Timer'),
        ),
      ),
    );

    if (af) {
      const center = h('div', { class: 'fast-center' });
      const info = h('div', { class: 'small muted', style: 'text-align:center;margin-top:4px' });
      el.append(
        h('div', { class: 'card' },
          center, info,
          h('button', { class: 'btn btn-primary btn-block', style: 'margin-top:16px', onclick: endFast }, 'Fasten beenden'),
          h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px;color:var(--danger)', onclick: () =>
            confirmSheet('Fasten abbrechen?', 'Der laufende Zeitraum wird verworfen und nicht in der Historie gespeichert.', 'Abbrechen & verwerfen', () => {
              store.update(st => { st.activeFast = null; });
              refresh();
            }) }, 'Verwerfen'),
        ),
      );

      const paint = () => {
        const elapsed = Date.now() - af.start;
        const target = af.targetH * 3600000;
        center.innerHTML = '';
        center.append(ring({
          size: 190, stroke: 15, value: elapsed, max: target,
          color: 'var(--c-fast)', overflowColor: 'var(--ok)',
          label: fmtDur(elapsed), sub: elapsed >= target ? 'Ziel erreicht!' : `von ${af.targetH}:00 h`,
        }));
        const end = new Date(af.start + target);
        info.textContent = elapsed >= target
          ? `Stark! Ziel um ${end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr erreicht – jedes weitere Fasten zählt als Bonus.`
          : `Gestartet ${new Date(af.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr · Ziel um ${end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`;
      };
      paint();
      ticker = setInterval(() => { if (document.querySelector('.fast-center')) paint(); else clearInterval(ticker); }, 30000);
    } else {
      let targetH = 16;
      const customIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'z. B. 14', style: 'max-width:110px' });
      const chips = h('div', { class: 'chip-row', style: 'justify-content:center;margin:8px 0 16px' },
        PRESETS.map(hrs => {
          const b = h('button', { class: 'chip' + (targetH === hrs ? ' active' : ''), onclick: () => {
            targetH = hrs; customIn.value = '';
            chips.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
          } }, `${hrs}:${24 - hrs}`);
          return b;
        }));

      el.append(
        h('div', { class: 'card', style: 'text-align:center' },
          h('div', { class: 'empty-icon', style: 'margin-bottom:10px' }, icon('timer', 28)),
          h('h3', { style: 'font-size:16px' }, 'Neues Fasten starten'),
          h('p', { class: 'small muted', style: 'margin-top:4px' }, 'Wähle dein Fasten-Fenster'),
          chips,
          h('div', { style: 'display:flex;gap:10px;justify-content:center;align-items:center;margin-bottom:16px' },
            h('span', { class: 'small muted' }, 'Eigenes Fenster:'), customIn, h('span', { class: 'small muted' }, 'Std.'),
          ),
          h('button', { class: 'btn btn-primary btn-block', onclick: () => {
            const custom = parseInt(customIn.value, 10);
            const hrs = Number.isFinite(custom) && custom >= 8 && custom <= 48 ? custom : targetH;
            store.update(st => { st.activeFast = { start: Date.now(), targetH: hrs }; });
            toast(`Fasten gestartet (${hrs} Std.)`); refresh();
          } }, icon('play', 18), 'Jetzt starten'),
        ),
        h('div', { class: 'notice' }, icon('flame', 18),
          h('span', {}, 'Während des Essensfensters hilft dir der ',
            h('button', { class: 'link', onclick: () => go('kalorien') }, 'Kalorientracker'),
            ', dein Tagesbudget zu halten.')),
      );
    }

    // Historie
    const hist = [...s.fasts].sort((a, b) => b.start - a.start).slice(0, 20);
    el.append(h('div', { class: 'section-title' }, h('h2', {}, 'Historie')));
    if (!hist.length) {
      el.append(emptyState('timer', 'Noch keine Fasten-Einträge', 'Abgeschlossene Fasten-Zeiträume erscheinen hier mit Dauer und Zielerreichung.'));
    } else {
      el.append(h('div', { class: 'list' }, hist.map(f => {
        const dur = f.end - f.start;
        const hitGoal = dur >= f.targetH * 3600000;
        return h('div', { class: 'row' },
          h('div', { class: 'module-ic', style: '--mc:var(--c-fast)' }, icon('timer', 20)),
          h('div', { class: 'grow' },
            h('div', { class: 'title num' }, fmtDur(dur)),
            h('div', { class: 'sub' }, `${fmtDate(dayKeyOf(f.start))} · Ziel ${f.targetH} Std. ${hitGoal ? 'erreicht' : 'nicht erreicht'}`),
          ),
          h('span', { class: 'badge tint', style: `--badge-c:${hitGoal ? 'var(--ok)' : 'var(--warn)'}` }, hitGoal ? '✓ Ziel' : 'Teilweise'),
        );
      })));
    }

    function endFast() {
      store.update(st => {
        st.fasts.push({ id: uid(), start: af.start, end: Date.now(), targetH: af.targetH });
        st.activeFast = null;
      });
      toast('Fasten beendet & gespeichert');
      refresh();
    }
  },
};

function dayKeyOf(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
