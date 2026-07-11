// Wiederverwendbare UI-Bausteine: DOM-Helper, Icons, Ringe, Charts,
// Bottom-Sheets, Toasts, Kalender-Grid. Reines Vanilla-JS, SVG von Hand.

// ---------- DOM ----------

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked') el.checked = !!v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(c));
  }
  return el;
}

export const svgNS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS(svgNS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const c of children.flat(Infinity)) if (c) el.append(c);
  return el;
}

// ---------- Icons (24er Stroke-Set, bewusst schlicht & geometrisch) ----------

const PATHS = {
  home: 'M4 11.2 12 4l8 7.2M6 10v9h12v-9M10 19v-5h4v5',
  flame: 'M12 3c1 3-3 4.5-3 8a3.5 3.5 0 0 0 7 0c0-1.4-.6-2.4-1.2-3.3C14.2 9 16 9.6 16.5 11c1.2 3.4-1 8-4.5 8s-6-2.6-6-6c0-4 4-6.5 6-10Z',
  drop: 'M12 3.5c3.2 4 6 7 6 10.3a6 6 0 1 1-12 0C6 10.5 8.8 7.5 12 3.5Z',
  steps: 'M5 17h4v3H5zM15 14h4v3h-4zM7 17V9a2.4 2.4 0 0 1 4.8 0v2M17 14V6a2.4 2.4 0 0 0-4.8 0v2',
  scale: 'M6 4h12l2 6a8 8 0 1 1-16 0l2-6ZM12 10l2.6-3.6M12 10a1.4 1.4 0 1 0 0 .01',
  dumbbell: 'M2.5 12h3M18.5 12h3M7 8v8M17 8v8M9.5 12h5M5 9.5v5M19 9.5v5',
  moon: 'M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z',
  smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.6 10h.01M15.4 10h.01M8.5 14.2c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 9v4l2.6 1.6M9.5 2.5h5',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4',
  calendar: 'M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1ZM4 10h16M8.5 3.5V7M15.5 3.5V7',
  note: 'M6 3.5h9L20 8.5V19a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 5 19V5A1.5 1.5 0 0 1 6.5 3.5ZM14.5 3.5v5.5H20M8.5 13h7M8.5 16.5h5',
  check: 'M5 12.5 10 17.5 19 7',
  checks: 'M4 12.5 8 16.5 15 8M12 15.5l2 2L21 10',
  bell: 'M6 16v-5a6 6 0 1 1 12 0v5l1.8 2.5H4.2L6 16ZM10 21a2.3 2.3 0 0 0 4 0',
  cart: 'M4 5h2.2l2 11h9.6l2.2-8H7M10 20a1.2 1.2 0 1 0 0-.01M17 20a1.2 1.2 0 1 0 0-.01',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 12h.01',
  chart: 'M4 20h16M7 20v-6M12 20V8M17 20v-9',
  gear: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm7.5-3.2 1.8-1.4-1.8-3.1-2.1.7a7 7 0 0 0-1.9-1.1L15 5h-3.6l-.5 2.1a7 7 0 0 0-1.9 1.1L6.9 7.5 5.1 10.6 6.9 12l-1.8 1.4 1.8 3.1 2.1-.7a7 7 0 0 0 1.9 1.1l.5 2.1H15l.5-2.1a7 7 0 0 0 1.9-1.1l2.1.7 1.8-3.1-1.8-1.4Z',
  pill: 'M8.2 3.8a4.5 4.5 0 0 1 6.4 0l5.6 5.6a4.5 4.5 0 0 1-6.4 6.4L8.2 10.2a4.5 4.5 0 0 1 0-6.4ZM11 7l6 6M4.5 15.5 3 17m3.5 1.5L5 20m4-1.5L7.5 20',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M6 12h12',
  chevL: 'M14.5 5.5 8 12l6.5 6.5',
  chevR: 'M9.5 5.5 16 12l-6.5 6.5',
  chevD: 'M6 9.5l6 6 6-6',
  x: 'M6 6l12 12M18 6 6 18',
  trash: 'M5 7h14M10 7V5h4v2M8 7l.8 13h6.4L16 7M10.5 10.5v6M13.5 10.5v6',
  edit: 'M14.5 5 19 9.5 8.5 20H4v-4.5L14.5 5ZM12.8 6.8l4.4 4.4',
  play: 'M8 5.5v13l10-6.5-10-6.5Z',
  pin: 'M9 4h6l-1 6 3 3v1.5H7V13l3-3-1-6ZM12 14.5V20',
  cloud: 'M7 18a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.3 9 4.5 4.5 0 0 1 17 18H7Z',
  wind: 'M3 8.5h9a2.5 2.5 0 1 0-2.4-3.2M3 12.5h14a2.5 2.5 0 1 1-2.4 3.2M3 16.5h7',
  export: 'M12 15V4M8 7.5 12 3.5l4 4M5 13v6h14v-6',
  import: 'M12 3v11M8 10.5l4 4 4-4M5 15v4h14v-4',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.6l-1.3 1.3M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.6l1.3-1.3',
  book: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H7A2 2 0 0 0 5 20.5V4.5ZM5 18.5A2 2 0 0 1 7 16.5h12M9 7.5h6',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 21 21',
  fork: 'M7 4v4a5 5 0 0 0 5 5 5 5 0 0 0 5-5V4M12 13v7M9.5 4h-.01M19.5 4h-.01',
  heart: 'M12 20s-7.5-4.6-9.3-9A5 5 0 0 1 12 6.6 5 5 0 0 1 21.3 11c-1.8 4.4-9.3 9-9.3 9Z',
  user: 'M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5a7.5 7.5 0 0 1 15 0',
  sync: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
  star: 'm12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.3 7.2 18.9l.9-5.4L4.2 9.7l5.4-.8L12 4Z',
};

export function icon(name, size = 22) {
  const el = s('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', 'aria-hidden': 'true', class: 'ic' });
  el.append(s('path', { d: PATHS[name] || PATHS.grid, stroke: 'currentColor', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  return el;
}

// ---------- Fortschrittsring ----------

export function ring({ size = 88, stroke = 9, value = 0, max = 100, color = 'var(--accent)', track = 'var(--ring-track)', label = '', sub = '', overflowColor = null }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const svg = s('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, class: 'ring' },
    s('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: track, 'stroke-width': stroke }),
    s('circle', {
      cx: size / 2, cy: size / 2, r, fill: 'none', stroke: color, 'stroke-width': stroke,
      'stroke-linecap': 'round', 'stroke-dasharray': c,
      'stroke-dashoffset': c * (1 - pct),
      transform: `rotate(-90 ${size / 2} ${size / 2})`, class: 'ring-fg',
    }),
  );
  if (overflowColor && max > 0 && value > max) {
    const over = Math.min((value - max) / max, 1);
    svg.append(s('circle', {
      cx: size / 2, cy: size / 2, r, fill: 'none', stroke: overflowColor, 'stroke-width': stroke,
      'stroke-linecap': 'round', 'stroke-dasharray': c, 'stroke-dashoffset': c * (1 - over),
      transform: `rotate(-90 ${size / 2} ${size / 2})`, class: 'ring-fg', opacity: 0.9,
    }));
  }
  return h('div', { class: 'ring-wrap', style: `width:${size}px` },
    svg,
    h('div', { class: 'ring-center' },
      h('div', { class: 'ring-label' }, label),
      sub ? h('div', { class: 'ring-sub' }, sub) : null,
    ),
  );
}

// ---------- Charts (SVG, eine Serie, ruhige Optik) ----------

// Balken: data = [{label, value, hint?, active?}], goal optional als Ziellinie
export function barChart({ data, goal = null, color = 'var(--accent)', height = 150, unit = '', formatValue = v => String(Math.round(v)) }) {
  const W = 340, H = height, padB = 22, padT = 16, padL = 4, padR = 4;
  const innerH = H - padB - padT;
  const max = Math.max(goal || 0, ...data.map(d => d.value), 1);
  const n = data.length;
  const slot = (W - padL - padR) / n;
  const bw = Math.min(26, slot * 0.55);

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img' });
  // Ziellinie
  if (goal) {
    const gy = padT + innerH * (1 - goal / max);
    svg.append(s('line', { x1: padL, x2: W - padR, y1: gy, y2: gy, class: 'chart-goal' }));
  }
  data.forEach((d, i) => {
    const x = padL + slot * i + (slot - bw) / 2;
    const bh = Math.max(innerH * (d.value / max), d.value > 0 ? 3 : 0);
    const y = padT + innerH - bh;
    if (d.value > 0) {
      svg.append(s('rect', { x, y, width: bw, height: bh, rx: 4, fill: color, opacity: d.active === false ? 0.32 : 1, class: 'bar' }));
    } else {
      svg.append(s('rect', { x, y: padT + innerH - 2, width: bw, height: 2, rx: 1, class: 'bar-empty' }));
    }
    svg.append(s('text', { x: x + bw / 2, y: H - 6, 'text-anchor': 'middle', class: 'chart-tick' }, d.label));
    if (d.showValue && d.value > 0) {
      svg.append(s('text', { x: x + bw / 2, y: y - 5, 'text-anchor': 'middle', class: 'chart-val' }, formatValue(d.value) + unit));
    }
  });
  return svg;
}

// Linie: data = [{x(label), value}], goal optional, Fläche dezent
export function lineChart({ data, goal = null, color = 'var(--accent)', height = 170, formatValue = v => String(v), ticks = 4 }) {
  const W = 340, H = height, padB = 22, padT = 14, padL = 8, padR = 8;
  const innerW = W - padL - padR, innerH = H - padB - padT;
  const vals = data.map(d => d.value);
  if (!vals.length) return s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart' });
  let min = Math.min(...vals, goal ?? Infinity);
  let max = Math.max(...vals, goal ?? -Infinity);
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  min -= span * 0.12; max += span * 0.12;

  const px = i => padL + (data.length === 1 ? innerW / 2 : innerW * (i / (data.length - 1)));
  const py = v => padT + innerH * (1 - (v - min) / (max - min));

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img' });

  // dezente horizontale Gitterlinien
  for (let t = 0; t <= 2; t++) {
    const y = padT + innerH * (t / 2);
    svg.append(s('line', { x1: padL, x2: W - padR, y1: y, y2: y, class: 'chart-grid' }));
  }
  if (goal != null) {
    svg.append(s('line', { x1: padL, x2: W - padR, y1: py(goal), y2: py(goal), class: 'chart-goal' }));
  }

  const pts = data.map((d, i) => [px(i), py(d.value)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  // Fläche
  svg.append(s('path', {
    d: `${path} L${pts[pts.length - 1][0].toFixed(1)} ${padT + innerH} L${pts[0][0].toFixed(1)} ${padT + innerH} Z`,
    fill: color, opacity: 0.10,
  }));
  svg.append(s('path', { d: path, fill: 'none', stroke: color, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

  // Endpunkt betonen + Wert
  const last = pts[pts.length - 1];
  svg.append(s('circle', { cx: last[0], cy: last[1], r: 4, fill: color, stroke: 'var(--surface)', 'stroke-width': 2 }));
  svg.append(s('text', {
    x: Math.min(last[0], W - padR - 4), y: Math.max(last[1] - 9, 11),
    'text-anchor': 'end', class: 'chart-val',
  }, formatValue(data[data.length - 1].value)));

  // X-Beschriftung: nur wenige Ticks
  const step = Math.max(1, Math.ceil(data.length / ticks));
  data.forEach((d, i) => {
    if (i % step === 0 || i === data.length - 1) {
      svg.append(s('text', { x: px(i), y: H - 6, 'text-anchor': 'middle', class: 'chart-tick' }, d.x));
    }
  });
  return svg;
}

// ---------- Overlays: Sheet, Modal, Toast, Confirm ----------

const sheetRoot = () => document.getElementById('sheet-root');

export function sheet(title, content, { onClose } = {}) {
  const root = sheetRoot();
  root.innerHTML = '';
  const close = () => {
    wrap.classList.remove('open');
    setTimeout(() => { root.innerHTML = ''; onClose?.(); }, 220);
  };
  const wrap = h('div', { class: 'sheet-wrap', onclick: e => { if (e.target === wrap) close(); } },
    h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'sheet-grab' }),
      h('div', { class: 'sheet-head' },
        h('h2', {}, title),
        h('button', { class: 'icon-btn', 'aria-label': 'Schließen', onclick: close }, icon('x', 20)),
      ),
      h('div', { class: 'sheet-body' }, content),
    ),
  );
  root.append(wrap);
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  return { close, el: wrap };
}

export function toast(msg, kind = 'ok') {
  const root = document.getElementById('toast-root');
  const t = h('div', { class: `toast toast-${kind}` }, kind === 'ok' ? icon('check', 18) : icon('bell', 18), h('span', {}, msg));
  root.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2400);
}

export function confirmSheet(title, text, actionLabel, onConfirm, { danger = true } = {}) {
  const sh = sheet(title, h('div', {},
    h('p', { class: 'muted', style: 'margin-bottom:16px' }, text),
    h('button', {
      class: `btn ${danger ? 'btn-danger' : 'btn-primary'} btn-block`,
      onclick: () => { sh.close(); onConfirm(); },
    }, actionLabel),
    h('button', { class: 'btn btn-ghost btn-block', style: 'margin-top:8px', onclick: () => sh.close() }, 'Abbrechen'),
  ));
  return sh;
}

// ---------- Kleinteile ----------

export function segment(options, value, onChange) {
  const wrap = h('div', { class: 'segment', role: 'tablist' });
  options.forEach(opt => {
    const b = h('button', {
      class: 'segment-btn' + (opt.value === value ? ' active' : ''),
      role: 'tab', 'aria-selected': String(opt.value === value),
      onclick: () => {
        wrap.querySelectorAll('.segment-btn').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
        b.classList.add('active'); b.setAttribute('aria-selected', 'true');
        onChange(opt.value);
      },
    }, opt.label);
    wrap.append(b);
  });
  return wrap;
}

export function emptyState(iconName, title, text, action) {
  return h('div', { class: 'empty' },
    h('div', { class: 'empty-icon' }, icon(iconName, 30)),
    h('h3', {}, title),
    text ? h('p', {}, text) : null,
    action || null,
  );
}

export function field(labelText, input, hint) {
  return h('label', { class: 'field' },
    h('span', { class: 'field-label' }, labelText),
    input,
    hint ? h('span', { class: 'field-hint' }, hint) : null,
  );
}

export function input(attrs = {}) {
  return h('input', { class: 'input', ...attrs });
}

export function progressBar(value, max, color = 'var(--accent)') {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return h('div', { class: 'pbar' }, h('div', { class: 'pbar-fill', style: `width:${pct}%;background:${color}` }));
}

// Statisches Monats-Grid; Termine als Punkte, onPick(dayKey)
export function calendarGrid({ monthDate, selected, marks = {}, onPick }) {
  const y = monthDate.getFullYear(), m = monthDate.getMonth();
  const first = new Date(y, m, 1);
  const startShift = (first.getDay() + 6) % 7; // Montag = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayK = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  const grid = h('div', { class: 'cal-grid' });
  ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].forEach(d => grid.append(h('div', { class: 'cal-head' }, d)));
  for (let i = 0; i < startShift; i++) grid.append(h('div', { class: 'cal-cell empty' }));
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dots = (marks[key] || []).slice(0, 4);
    grid.append(h('button', {
      class: 'cal-cell' + (key === selected ? ' selected' : '') + (key === todayK ? ' today' : ''),
      onclick: () => onPick(key),
    },
      h('span', { class: 'cal-num' }, String(d)),
      dots.length ? h('span', { class: 'cal-dots' }, dots.map(c => h('i', { style: `background:${c}` }))) : null,
    ));
  }
  return grid;
}
