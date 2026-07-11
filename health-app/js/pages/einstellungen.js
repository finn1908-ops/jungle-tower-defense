// Einstellungen: 3 Design-Themes mit Vorschau, Hell/Dunkel/Auto, Profil,
// Wasser-Schnellwahl, Wetter-Standort, Daten-Export/-Import, Zurücksetzen.

import { store, fmtNum } from '../store.js';
import { h, icon, toast, input, field, segment, confirmSheet } from '../ui.js';
import { refresh, applyTheme, go } from '../app.js';

const THEMES = [
  { id: 'midnight', name: 'Midnight', desc: 'Sportlich-premium', colors: ['#0b1020', '#43dfb4', '#3ba4f5'] },
  { id: 'aurora', name: 'Aurora', desc: 'Weich & farbig', colors: ['#f3ecfd', '#8b5cf0', '#ef6e9b'] },
  { id: 'titanium', name: 'Titanium', desc: 'Klar & kantig', colors: ['#f2f2f0', '#2e56f5', '#141619'] },
];

export default {
  title: 'Einstellungen',
  render(el) {
    const s = store.get();

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Einstellungen'),
          h('div', { class: 'sub' }, 'Aussehen, Profil & Daten'),
        ),
      ),

      // ---------- Design ----------
      h('div', { class: 'section-title' }, h('h2', {}, 'Design')),
      h('div', { class: 'card' },
        h('div', { class: 'theme-pick', style: 'margin-bottom:14px' },
          THEMES.map(t => h('button', {
            class: 'theme-card' + (s.settings.theme === t.id ? ' active' : ''),
            onclick: () => {
              store.update(st => { st.settings.theme = t.id; });
              applyTheme(); refresh();
              toast(`Theme „${t.name}" aktiv`);
            },
          },
            h('div', { class: 'theme-swatch', style: `background:${t.colors[0]}` },
              h('i', { style: `width:26px;height:26px;border-radius:9px;background:linear-gradient(135deg,${t.colors[1]},${t.colors[2]});top:13px;left:12px` }),
              h('i', { style: `width:44px;height:7px;border-radius:99px;background:${t.colors[1]}55;top:16px;left:46px` }),
              h('i', { style: `width:32px;height:7px;border-radius:99px;background:${t.colors[2]}55;top:29px;left:46px` }),
            ),
            h('b', {}, t.name),
            h('span', { class: 'small muted', style: 'font-size:11px' }, t.desc),
          )),
        ),
        h('div', { class: 'field-label', style: 'margin-bottom:6px' }, 'Erscheinungsbild'),
        segment([
          { label: 'Auto', value: 'auto' }, { label: 'Hell', value: 'light' }, { label: 'Dunkel', value: 'dark' },
        ], s.settings.mode, v => {
          store.update(st => { st.settings.mode = v; });
          applyTheme();
        }),
        h('p', { class: 'small muted' }, '„Auto" folgt dem Hell-/Dunkelmodus deines iPhones.'),
      ),

      // ---------- Profil ----------
      h('div', { class: 'section-title' }, h('h2', {}, 'Profil')),
      h('div', { class: 'card' },
        field('Dein Name (für die Begrüßung)', input({
          type: 'text', value: s.settings.name || '', placeholder: 'z. B. Finn',
          onchange: e => { store.update(st => { st.settings.name = e.target.value.trim(); }); toast('Gespeichert'); },
        })),
        field('Körpergröße (cm, für BMI)', input({
          type: 'number', inputmode: 'numeric', value: s.settings.heightCm || '', placeholder: 'z. B. 183',
          onchange: e => {
            const v = parseInt(e.target.value, 10);
            store.update(st => { st.settings.heightCm = Number.isFinite(v) && v > 80 && v < 250 ? v : null; });
            toast('Gespeichert');
          },
        })),
        h('button', { class: 'btn btn-ghost btn-block btn-s', onclick: () => go('ziele') }, icon('target', 16), 'Ziele bearbeiten'),
      ),

      // ---------- Wasser ----------
      h('div', { class: 'section-title' }, h('h2', {}, 'Wasser-Schnellwahl')),
      h('div', { class: 'card' },
        h('p', { class: 'small muted', style: 'margin-bottom:10px' }, 'Die drei Buttons beim Wasser-Tracker und im Schnell-Erfassen (ml):'),
        h('div', { class: 'input-grid-3' },
          s.settings.glasses.map((ml, i) => input({
            type: 'number', inputmode: 'numeric', value: ml,
            onchange: e => {
              const v = parseInt(e.target.value, 10);
              if (Number.isFinite(v) && v > 0 && v <= 2000) {
                store.update(st => { st.settings.glasses[i] = v; });
                toast('Gespeichert');
              }
            },
          })),
        ),
      ),

      // ---------- Wetter ----------
      h('div', { class: 'section-title' }, h('h2', {}, 'Wetter')),
      h('div', { class: 'card' },
        segment([
          { label: 'GPS-Standort', value: 'gps' }, { label: 'Feste Stadt', value: 'city' },
        ], s.settings.weather.useGps ? 'gps' : 'city', v => {
          store.update(st => { st.settings.weather.useGps = v === 'gps'; });
          toast(v === 'gps' ? 'GPS aktiv' : 'Stadt wird beim Wetter gewählt');
        }),
        h('p', { class: 'small muted' },
          s.settings.weather.place?.name
            ? `Gewählte Stadt: ${s.settings.weather.place.name} (änderbar auf der Wetter-Seite)`
            : 'Eine feste Stadt wählst du auf der Wetter-Seite über „Stadt ändern".'),
      ),

      // ---------- Daten ----------
      h('div', { class: 'section-title' }, h('h2', {}, 'Deine Daten')),
      h('div', { class: 'card' },
        h('p', { class: 'small muted', style: 'margin-bottom:12px' },
          'Alle Daten liegen nur lokal auf diesem Gerät. Sichere sie regelmäßig als Datei – z. B. bevor du das Gerät wechselst.'),
        h('button', { class: 'btn btn-primary btn-block', onclick: exportData }, icon('export', 18), 'Backup exportieren (JSON)'),
        h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px', onclick: importData }, icon('import', 18), 'Backup importieren'),
        h('div', { class: 'divider' }),
        h('button', { class: 'btn btn-ghost btn-block', style: 'color:var(--danger)', onclick: () =>
          confirmSheet('Wirklich alles löschen?', 'Alle Einträge, Ziele und Einstellungen werden unwiderruflich von diesem Gerät entfernt. Exportiere vorher ein Backup!', 'Alles löschen', () => {
            store.wipe();
            applyTheme(); refresh();
            toast('Alle Daten gelöscht');
          }) }, icon('trash', 18), 'Alle Daten löschen'),
      ),

      h('p', { class: 'small muted', style: 'text-align:center;margin-top:18px' },
        'Pulse · deine Gesundheits- & Alltags-App', h('br'), 'Wetterdaten: Open-Meteo'),
    );

    function exportData() {
      const blob = new Blob([store.exportJson()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const d = new Date();
      a.href = url;
      a.download = `pulse-backup-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('Backup erstellt');
    }

    function importData() {
      const fileIn = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none' });
      fileIn.addEventListener('change', () => {
        const file = fileIn.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          confirmSheet('Backup importieren?', 'Die aktuellen Daten auf diesem Gerät werden durch das Backup ersetzt.', 'Importieren', () => {
            try {
              store.importJson(reader.result);
              applyTheme(); refresh();
              toast('Backup importiert');
            } catch (e) {
              toast(e.message || 'Datei konnte nicht gelesen werden', 'warn');
            }
          }, { danger: false });
        };
        reader.readAsText(file);
      });
      document.body.append(fileIn);
      fileIn.click();
      setTimeout(() => fileIn.remove(), 60000);
    }
  },
};
