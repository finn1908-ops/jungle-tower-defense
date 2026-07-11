// Wetter: aktuelle Lage, Stunden-Verlauf, 7-Tage-Vorschau.
// GPS zuerst, Stadtsuche als Fallback, Offline-Cache.

import { store } from '../store.js';
import { h, icon, toast, input, emptyState, sheet } from '../ui.js';
import { getWeather, searchCity, fetchWeather, wmoInfo } from '../weather.js';
import { refresh } from '../app.js';

let loading = false;

export default {
  title: 'Wetter',
  render(el) {
    const s = store.get();
    const cache = s.weatherCache;

    el.append(
      h('div', { class: 'page-head' },
        h('div', {},
          h('h1', { class: 'page-title' }, 'Wetter'),
          h('div', { class: 'sub' }, cache?.place?.name || (s.settings.weather.useGps ? 'Dein Standort' : 'Kein Ort gewählt')),
        ),
        h('button', { class: 'icon-btn', 'aria-label': 'Aktualisieren', onclick: () => load(true) }, icon('sync', 19)),
      ),
    );

    if (!cache) {
      if (!loading) load(false);
      el.append(emptyState('cloud', loading ? 'Wetter wird geladen …' : 'Noch keine Wetterdaten',
        'Pulse nutzt deinen Standort (einmalige Freigabe) oder eine Stadt deiner Wahl.',
        h('div', { class: 'chip-row', style: 'justify-content:center' },
          h('button', { class: 'chip active', onclick: () => load(true) }, 'Standort verwenden'),
          h('button', { class: 'chip', onclick: citySearch }, 'Stadt suchen'),
        )));
      return;
    }

    const cur = cache.data.current;
    const daily = cache.data.daily;
    const hourly = cache.data.hourly;
    const [desc, ic] = wmoInfo(cur.weather_code);
    const age = Math.round((Date.now() - cache.fetchedAt) / 60000);

    // Stunden ab jetzt (24 h)
    const nowIso = new Date().toISOString().slice(0, 13);
    const startIdx = Math.max(0, hourly.time.findIndex(t => t.slice(0, 13) >= nowIso));
    const hours = hourly.time.slice(startIdx, startIdx + 24).map((t, i) => ({
      time: t.slice(11, 16),
      temp: Math.round(hourly.temperature_2m[startIdx + i]),
      code: hourly.weather_code[startIdx + i],
      rain: hourly.precipitation_probability?.[startIdx + i],
    }));

    el.append(
      h('div', { class: 'card' },
        h('div', { class: 'weather-hero' },
          h('div', {},
            h('div', { class: 'weather-temp' }, `${Math.round(cur.temperature_2m)}°`),
            h('div', { class: 'muted', style: 'font-weight:600' }, desc),
            h('div', { class: 'small muted' }, `Gefühlt ${Math.round(cur.apparent_temperature)}°`),
          ),
          h('div', { class: 'module-ic', style: '--mc:var(--c-water);width:72px;height:72px;border-radius:22px' }, icon(ic, 40)),
        ),
        h('div', { class: 'divider' }),
        h('div', { class: 'card-row', style: 'justify-content:space-around' },
          mini('wind', `${Math.round(cur.wind_speed_10m)} km/h`, 'Wind'),
          mini('drop', `${cur.relative_humidity_2m} %`, 'Luftfeuchte'),
          mini('sun', String(Math.round(cur.uv_index ?? 0)), 'UV-Index'),
        ),
      ),

      h('div', { class: 'section-title' }, h('h2', {}, 'Nächste Stunden')),
      h('div', { class: 'card pad-s' },
        h('div', { class: 'weather-hourly' }, hours.map(hr =>
          h('div', { class: 'weather-hour' },
            h('span', {}, hr.time),
            icon(wmoInfo(hr.code)[1], 19),
            h('b', {}, `${hr.temp}°`),
            hr.rain != null && hr.rain > 15 ? h('span', { style: 'color:var(--c-water);font-size:11px' }, `${hr.rain}%`) : h('span', { style: 'font-size:11px' }, ' '),
          ))),
      ),

      h('div', { class: 'section-title' }, h('h2', {}, '7-Tage-Vorschau')),
      h('div', { class: 'list' }, daily.time.map((t, i) => {
        const [dDesc, dIc] = wmoInfo(daily.weather_code[i]);
        const label = i === 0 ? 'Heute' : new Date(t + 'T12:00').toLocaleDateString('de-DE', { weekday: 'long' });
        return h('div', { class: 'row' },
          h('div', { class: 'module-ic', style: '--mc:var(--c-water)' }, icon(dIc, 20)),
          h('div', { class: 'grow' },
            h('div', { class: 'title' }, label),
            h('div', { class: 'sub' }, dDesc + (daily.precipitation_probability_max?.[i] > 15 ? ` · ${daily.precipitation_probability_max[i]} % Regen` : '')),
          ),
          h('div', { class: 'num', style: 'font-weight:700' },
            `${Math.round(daily.temperature_2m_max[i])}°`,
            h('span', { class: 'muted', style: 'font-weight:600' }, ` / ${Math.round(daily.temperature_2m_min[i])}°`)),
        );
      })),

      h('div', { class: 'card-row', style: 'justify-content:space-between;margin-top:4px' },
        h('span', { class: 'small muted' }, `Stand: vor ${age <= 1 ? 'einer Minute' : age + ' Minuten'} · Open-Meteo`),
        h('button', { class: 'link small', onclick: citySearch }, 'Stadt ändern'),
      ),
    );

    async function load(force) {
      loading = true;
      try {
        await getWeather({ force });
        loading = false;
        refresh();
      } catch (e) {
        loading = false;
        toast(e.message || 'Wetter konnte nicht geladen werden', 'warn');
      }
    }

    function citySearch() {
      const qIn = input({ type: 'search', placeholder: 'Stadt eingeben …' });
      const results = h('div', { class: 'list', style: 'margin-top:12px' });
      const gpsChip = h('button', { class: 'chip' + (s.settings.weather.useGps ? ' active' : ''), onclick: () => {
        store.update(st => { st.settings.weather.useGps = true; });
        sh.close(); load(true);
      } }, 'GPS-Standort verwenden');

      let debounce = null;
      qIn.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(async () => {
          const q = qIn.value.trim();
          if (q.length < 2) { results.innerHTML = ''; return; }
          try {
            const cities = await searchCity(q);
            results.innerHTML = '';
            cities.forEach(c => results.append(h('button', { class: 'row', style: 'width:100%;text-align:left', onclick: async () => {
              store.update(st => { st.settings.weather.useGps = false; st.settings.weather.place = c; });
              sh.close();
              try { await fetchWeather(c); refresh(); } catch { toast('Abruf fehlgeschlagen', 'warn'); }
            } },
              h('div', { class: 'module-ic', style: '--mc:var(--c-water)' }, icon('search', 18)),
              h('div', { class: 'grow title' }, c.name),
            )));
          } catch { results.innerHTML = ''; }
        }, 350);
      });

      const sh = sheet('Wetter-Standort', h('div', {},
        h('div', { style: 'margin-bottom:12px' }, gpsChip),
        qIn, results,
      ));
      setTimeout(() => qIn.focus(), 320);
    }
  },
};

const mini = (ic, val, label) => h('div', { style: 'text-align:center' },
  h('div', { style: 'display:flex;justify-content:center;color:var(--ink-2)' }, icon(ic, 18)),
  h('div', { class: 'num', style: 'font-weight:800;margin-top:3px' }, val),
  h('div', { class: 'small muted' }, label));
