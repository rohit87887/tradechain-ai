/* ==========================================================================
   TradeChain AI — UI helpers (icons, formatting, modal, toast, charts)
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Icons (stroke, 24px grid) ---------- */
  const P = {
    dashboard: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/>',
    journal: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    analytics: '<circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.4 6.4"/><path d="M12 12 3.5 9.5"/>',
    ai: '<path d="M12 3l1.8 4.9L19 9.5l-5.2 1.6L12 16l-1.8-4.9L5 9.5l5.2-1.6z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    chain: '<path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4z"/><path d="M12 12 20 7.4M12 12v9.2M12 12 4 7.4"/>',
    bolt: '<path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    shield: '<path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.6 7.5 10 4.3-1.4 7.5-5.4 7.5-10v-6z"/><path d="m8.8 12 2.2 2.2 4.2-4.4"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    arrowDown: '<path d="M12 5v14M5 12l7 7 7-7"/>',
    trendUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    trendDown: '<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
    wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1.3" fill="currentColor"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    cube: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
    play: '<path d="m7 4 13 8-13 8z"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    sparkle: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.5 1.3 2.8 2.5 2.8z"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    externalLink: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  };
  function icon(name, cls) {
    return `<svg ${cls ? `class="${cls}"` : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
  }

  /* ---------- Formatting ---------- */
  const inr0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const usd = (dec) => new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  function inr(n, opts = {}) {
    const sign = opts.sign ? (n > 0 ? '+' : n < 0 ? '-' : '') : (n < 0 ? '-' : '');
    const body = (opts.dec ? inr2 : inr0).format(Math.abs(n));
    return `${sign}₹${body}`;
  }
  function inrCompact(n) {
    const a = Math.abs(n);
    if (a >= 1e7) return '₹' + (n / 1e7).toFixed(2) + 'Cr';
    if (a >= 1e5) return '₹' + (n / 1e5).toFixed(2) + 'L';
    if (a >= 1e3) return '₹' + (n / 1e3).toFixed(1) + 'k';
    return '₹' + n.toFixed(0);
  }
  function pct(n, dec = 2, sign = true) {
    return (sign && n > 0 ? '+' : '') + n.toFixed(dec) + '%';
  }
  function price(asset, value) {
    const a = window.TC_DATA.ASSETS[asset];
    if (!a) return value;
    if (a.cur === '$') return '$' + usd(a.dec).format(value);
    return '₹' + inr2.format(value);
  }
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d, withYear) {
    return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}${withYear ? ' ' + d.getFullYear() : ''}`;
  }
  function fmtTime(d) {
    let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0');
    const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${ap}`;
  }
  function shortHash(h, a = 4, b = 4) {
    if (!h) return '—';
    return h.slice(0, 2 + a) + '...' + h.slice(-b);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function assetIcon(asset, size) {
    const a = window.TC_DATA.ASSETS[asset];
    const color = a ? a.color : '#5b8cff';
    const label = a ? a.short : String(asset).slice(0, 3).toUpperCase();
    const s = size ? `width:${size}px;height:${size}px;font-size:${Math.round(size / 3.2)}px;` : '';
    return `<span class="asset-ico" style="${s}background:linear-gradient(135deg, ${color}, ${color}99);">${label}</span>`;
  }

  /* ---------- Sparkline (inline SVG) ---------- */
  let sparkId = 0;
  function sparkline(values, color, w = 160, h = 56) {
    const id = 'sg' + (++sparkId);
    const min = Math.min(...values), max = Math.max(...values);
    const span = max - min || 1;
    const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 4 - ((v - min) / span) * (h - 10)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" width="100%" height="100%">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <path d="${d} L${w} ${h} L0 ${h} Z" fill="url(#${id})"/>
      <path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
    </svg>`;
  }

  /* ---------- Score ring ---------- */
  function ring(value, size, stroke, color, inner) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const gid = 'rg' + (++sparkId);
    return `<div class="ring" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b8cff"/><stop offset="1" stop-color="#9b7bff"/></linearGradient></defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="${stroke}"/>
        <circle class="ring-arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color || `url(#${gid})`}" stroke-width="${stroke}" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${c}" data-target="${c * (1 - value / 100)}"/>
      </svg>
      <div class="ring-label">${inner || ''}</div>
    </div>`;
  }
  function animateRings(root) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      (root || document).querySelectorAll('.ring-arc[data-target]').forEach((el) => { el.style.strokeDashoffset = el.dataset.target; });
      (root || document).querySelectorAll('.progress > span[data-w]').forEach((el) => { el.style.width = el.dataset.w; });
    }));
  }

  /* ---------- Count-up ---------- */
  function countUp(root) {
    (root || document).querySelectorAll('[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const useInr = el.dataset.inr === '1';
      const dur = 1100, t0 = performance.now();
      function frame(t) {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        const v = target * e;
        const body = useInr ? inr0.format(Math.round(v)) : v.toFixed(dec);
        el.textContent = prefix + body + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------- Modal ---------- */
  let activeModal = null;
  function openModal({ title, sub, body, foot, size, onMount, onClose, dismissible = true }) {
    closeModal(true);
    const root = document.getElementById('modal-root');
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal ${size || ''}" role="dialog" aria-modal="true" aria-label="${esc(title || 'Dialog')}">
      ${title ? `<div class="modal-head"><div><div class="modal-title">${title}</div>${sub ? `<div class="modal-sub">${sub}</div>` : ''}</div>
        <button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>` : ''}
      <div class="modal-body">${body || ''}</div>
      ${foot ? `<div class="modal-foot">${foot}</div>` : ''}
    </div>`;
    root.appendChild(wrap);
    document.body.style.overflow = 'hidden';
    const modal = wrap.querySelector('.modal');
    activeModal = { wrap, onClose, dismissible };
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap && activeModal && activeModal.dismissible) closeModal(); });
    wrap.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closeModal()));
    if (onMount) onMount(modal);
    const first = modal.querySelector('input, select, textarea');
    if (first && window.innerWidth > 760) setTimeout(() => first.focus(), 60);
    return modal;
  }
  function setDismissible(v) { if (activeModal) activeModal.dismissible = v; }
  function closeModal(immediate) {
    if (!activeModal) return;
    const { wrap, onClose } = activeModal;
    activeModal = null;
    document.body.style.overflow = '';
    if (onClose) onClose();
    if (immediate) { wrap.remove(); return; }
    wrap.classList.add('closing');
    setTimeout(() => wrap.remove(), 200);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal && activeModal.dismissible) closeModal();
  });

  /* ---------- Toast ---------- */
  function toast(msg, type = 'success') {
    const root = document.getElementById('toast-root');
    const map = {
      success: ['checkCircle', 'var(--green-soft)', 'var(--green)'],
      info: ['info', 'var(--blue-soft)', 'var(--blue)'],
      warn: ['alert', 'var(--amber-soft)', 'var(--amber)'],
      ai: ['ai', 'var(--purple-soft)', 'var(--purple)'],
      chain: ['chain', 'var(--blue-soft)', 'var(--cyan)'],
    };
    const [ic, bg, fg] = map[type] || map.success;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="t-ico" style="background:${bg};color:${fg}">${icon(ic)}</span><div>${msg}</div>`;
    root.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3400);
  }

  /* ---------- Clipboard ---------- */
  function copy(text) {
    const done = () => toast('Copied to clipboard', 'info');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    ta.remove();
  }

  /* ---------- Hashing (local SHA-256 — simulation only) ---------- */
  async function sha256(str) {
    try {
      if (window.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return '0x' + Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      }
    } catch (e) { /* fall through */ }
    // Fallback: FNV-style mixing to 64 hex chars
    let out = '';
    for (let k = 0; k < 8; k++) {
      let h = 0x811c9dc5 ^ (k * 0x9e3779b9);
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      out += (h >>> 0).toString(16).padStart(8, '0');
    }
    return '0x' + out.toUpperCase();
  }
  const randHex = (n) => Array.from({ length: n }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Charts ---------- */
  let charts = [];
  function chartDefaults() {
    if (!window.Chart) return;
    const C = window.Chart;
    C.defaults.color = '#7d8699';
    C.defaults.font.family = "Inter, system-ui, sans-serif";
    C.defaults.font.size = 11;
    C.defaults.borderColor = 'rgba(255,255,255,0.05)';
    C.defaults.plugins.legend.display = false;
    C.defaults.maintainAspectRatio = false;
    C.defaults.animation.duration = 900;
    Object.assign(C.defaults.plugins.tooltip, {
      backgroundColor: 'rgba(17, 21, 31, 0.96)',
      borderColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 10,
      titleColor: '#e9edf5',
      bodyColor: '#b4bccc',
      titleFont: { weight: '600', size: 12 },
      bodyFont: { size: 12 },
      displayColors: false,
      caretSize: 5,
    });
    // Vertical crosshair for line charts
    C.register({
      id: 'crosshair',
      afterDraw(chart) {
        if (!chart.options.plugins.crosshair) return;
        const act = chart.tooltip && chart.tooltip.getActiveElements();
        if (!act || !act.length) return;
        const x = act[0].element.x, y = act[0].element.y;
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = chart.data.datasets[0].borderColor;
        ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#0b0e15'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      },
    });
  }
  function makeChart(canvas, config) {
    if (!window.Chart || !canvas) return null;
    const c = new window.Chart(canvas.getContext('2d'), config);
    charts.push(c);
    return c;
  }
  function destroyCharts() { charts.forEach((c) => c.destroy()); charts = []; }
  function gradient(ctx, area, color, a1 = 0.28, a2 = 0) {
    const g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    g.addColorStop(0, hexA(color, a1));
    g.addColorStop(1, hexA(color, a2));
    return g;
  }
  function hexA(hexc, a) {
    const h = hexc.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  /* ---------- Floating tooltip for HTML viz ---------- */
  let tipEl = null;
  function tip(html, e) {
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'floating-tip'; document.body.appendChild(tipEl); }
    if (!html) { tipEl.style.opacity = '0'; return; }
    tipEl.innerHTML = html;
    const x = Math.min(e.clientX + 14, window.innerWidth - tipEl.offsetWidth - 10);
    tipEl.style.left = x + 'px';
    tipEl.style.top = (e.clientY - tipEl.offsetHeight - 12) + 'px';
    tipEl.style.opacity = '1';
  }

  /* ---------- Dropdown helper ---------- */
  function closeDropdowns(except) {
    document.querySelectorAll('.dropdown.open').forEach((d) => { if (d !== except) d.classList.remove('open'); });
  }
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-dropdown-trigger]');
    if (trigger) {
      const dd = trigger.closest('.dropdown');
      closeDropdowns(dd);
      dd.classList.toggle('open');
      return;
    }
    if (!e.target.closest('.dropdown-menu')) closeDropdowns();
  });

  window.UI = {
    icon, inr, inrCompact, pct, price, fmtDate, fmtTime, shortHash, esc, assetIcon,
    sparkline, ring, animateRings, countUp,
    openModal, closeModal, setDismissible, toast, copy, sha256, randHex, sleep,
    chartDefaults, makeChart, destroyCharts, gradient, hexA, tip, closeDropdowns, MONTHS,
  };
})();
