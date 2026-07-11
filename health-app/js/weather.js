// Open-Meteo-Anbindung: kostenlos, ohne API-Key.
// GPS zuerst, Stadtsuche als Fallback; letzter Abruf wird gecacht,
// damit das Wetter auch offline sichtbar bleibt.

import { store } from './store.js';

const WMO = {
  0:  ['Klar', 'sun'], 1: ['Überwiegend klar', 'sun'], 2: ['Teils bewölkt', 'cloud'], 3: ['Bedeckt', 'cloud'],
  45: ['Nebel', 'cloud'], 48: ['Reifnebel', 'cloud'],
  51: ['Leichter Niesel', 'drop'], 53: ['Niesel', 'drop'], 55: ['Starker Niesel', 'drop'],
  61: ['Leichter Regen', 'drop'], 63: ['Regen', 'drop'], 65: ['Starkregen', 'drop'],
  66: ['Gefrierender Regen', 'drop'], 67: ['Gefrierender Regen', 'drop'],
  71: ['Leichter Schnee', 'cloud'], 73: ['Schnee', 'cloud'], 75: ['Starker Schnee', 'cloud'], 77: ['Schneegriesel', 'cloud'],
  80: ['Regenschauer', 'drop'], 81: ['Regenschauer', 'drop'], 82: ['Heftige Schauer', 'drop'],
  85: ['Schneeschauer', 'cloud'], 86: ['Schneeschauer', 'cloud'],
  95: ['Gewitter', 'wind'], 96: ['Gewitter + Hagel', 'wind'], 99: ['Gewitter + Hagel', 'wind'],
};

export const wmoInfo = code => WMO[code] || ['–', 'cloud'];

export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Keine Standort-Unterstützung.'));
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { timeout: 12000, maximumAge: 10 * 60 * 1000 },
    );
  });
}

export async function searchCity(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=de&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ortssuche fehlgeschlagen.');
  const data = await res.json();
  return (data.results || []).map(r => ({
    name: [r.name, r.admin1, r.country_code].filter(Boolean).join(', '),
    lat: r.latitude, lon: r.longitude,
  }));
}

export async function fetchWeather({ lat, lon, name }) {
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,uv_index'
    + '&hourly=temperature_2m,weather_code,precipitation_probability'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset'
    + '&timezone=auto&forecast_days=7';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Wetterdienst nicht erreichbar.');
  const data = await res.json();
  const cache = { fetchedAt: Date.now(), place: { lat, lon, name: name || null }, data };
  store.update(s => { s.weatherCache = cache; });
  return cache;
}

// Liefert gecachte Daten sofort; refresht, wenn älter als 30 Minuten.
export async function getWeather({ force = false } = {}) {
  const s = store.get();
  const cache = s.weatherCache;
  const fresh = cache && Date.now() - cache.fetchedAt < 30 * 60 * 1000;
  if (fresh && !force) return cache;

  let place = null;
  if (s.settings.weather.useGps) {
    try { place = await getPosition(); }
    catch { place = s.settings.weather.place || cache?.place || null; }
  } else {
    place = s.settings.weather.place || cache?.place || null;
  }
  if (!place) throw new Error('Kein Standort. Aktiviere GPS oder wähle eine Stadt in den Einstellungen.');

  try {
    // Ortsname per Reverse-Suche nur behalten, wenn schon bekannt
    if (!place.name && s.settings.weather.place?.name) place.name = s.settings.weather.place.name;
    return await fetchWeather(place);
  } catch (e) {
    if (cache) return cache; // offline: alter Stand ist besser als nichts
    throw e;
  }
}
