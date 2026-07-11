// Erzeugt .ics-Kalenderdateien (VEVENT + VALARM, optional RRULE) und
// startet den Download – iOS öffnet daraufhin den Kalender-Import.
// So bekommen Erinnerungen echte System-Benachrichtigungen ohne Server.

function pad(n) { return String(n).padStart(2, '0'); }

function icsStamp(dateKey, time) {
  // lokale Zeit als "floating time" – iOS interpretiert sie in der Gerätezone
  const [y, m, d] = dateKey.split('-');
  const [hh, mm] = (time || '09:00').split(':');
  return `${y}${m}${d}T${pad(hh)}${pad(mm)}00`;
}

function esc(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

const RRULES = { daily: 'FREQ=DAILY', weekly: 'FREQ=WEEKLY' };

// entry: {title, date:'YYYY-MM-DD', time:'HH:MM', durationMin?, repeat?, leadMin?, note?}
export function buildIcs(entry) {
  const start = icsStamp(entry.date, entry.time);
  const endDate = new Date(
    ...entry.date.split('-').map((v, i) => i === 1 ? +v - 1 : +v),
  );
  const [hh, mm] = (entry.time || '09:00').split(':').map(Number);
  endDate.setHours(hh, mm + (entry.durationMin || 30));
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@pulse.app`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pulse//DE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${esc(entry.title)}`,
  ];
  if (entry.note) lines.push(`DESCRIPTION:${esc(entry.note)}`);
  if (entry.repeat && RRULES[entry.repeat]) lines.push(`RRULE:${RRULES[entry.repeat]}`);
  lines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(entry.title)}`,
    `TRIGGER:-PT${Math.max(0, entry.leadMin ?? 0)}M`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  );
  return lines.join('\r\n');
}

export function downloadIcs(entry) {
  const blob = new Blob([buildIcs(entry)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(entry.title || 'erinnerung').toLowerCase().replace(/[^a-zä-ü0-9]+/gi, '-')}.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
