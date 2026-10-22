/* ==========================================================================
   TradeChain AI — app shell, workspaces & router
   Two workspaces:
   - demo : curated sample journal (in memory, resets on reload)
   - user : the visitor's own journal, saved in this browser (localStorage)
   ========================================================================== */
(function () {
  'use strict';
  const D = window.TC_DATA;
  const { icon, esc } = window.UI;
  const KEY = 'tradechain.workspace.v1';
  const MODE_KEY = 'tradechain.mode';

  /* ---------- Storage (guarded: private windows may block it) ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  function demoWorkspace() {
    return {
      mode: 'demo',
      trades: D.trades.map((t) => ({ ...t })),
      automations: D.automations.map((a) => ({ ...a, conditions: a.conditions.map((c) => ({ ...c })) })),
      notifications: D.notifications.map((n) => ({ ...n })),
      chainStats: { ...D.chainStats },
      snapshots: [], executions: [],
      nextId: 1026, lastAdded: null, doneActions: new Set(), demoBanner: true,
      portfolio: 'Main Portfolio',
      user: {
        name: 'Demo Trader', greetName: 'Trader', email: 'trader@tradechain.demo', avatar: null,
        currency: 'INR (₹)', defaultStrategy: 'Breakout', risk: 'Moderate', maxRisk: 1.5,
        walletConnected: true, autoVerify: false, capital: 219600, experience: 'Intermediate',
      },
    };
  }

  function newUserWorkspace(profile) {
    const now = new Date();
    return {
      mode: 'user',
      createdAt: now,
      trades: [], automations: [], snapshots: [], executions: [],
      notifications: [
        { kind: 'ai', html: `Welcome to TradeChain AI, <b>${esc(profile.name.split(' ')[0])}</b>! Log your first trade to get started.`, time: 'Just now', unread: true },
        { kind: 'chain', html: 'Your <b>demo wallet</b> is connected to Ethereum Testnet (simulated)', time: 'Just now', unread: true },
      ],
      chainStats: { verified: 0 },
      nextId: 1001, lastAdded: null, doneActions: new Set(), demoBanner: true, checklistHidden: false,
      portfolio: profile.portfolio || 'My Portfolio',
      user: {
        name: profile.name, greetName: profile.name.split(' ')[0], email: profile.email || '', avatar: null,
        currency: 'INR (₹)', defaultStrategy: profile.strategy || 'Breakout', risk: profile.risk || 'Moderate',
        maxRisk: profile.maxRisk || 1, walletConnected: true, autoVerify: false,
        capital: profile.capital, experience: profile.experience || 'Beginner', markets: profile.markets || [],
      },
    };
  }

  function serialize(ws) {
    return JSON.stringify({
      ...ws,
      lastAdded: null,
      doneActions: [...ws.doneActions],
      createdAt: ws.createdAt ? ws.createdAt.toISOString() : null,
      trades: ws.trades.map((t) => ({ ...t, date: t.date.toISOString() })),
      snapshots: ws.snapshots.map((s) => ({ ...s, date: s.date.toISOString() })),
    });
  }
  function revive(json) {
    try {
      const o = JSON.parse(json);
      if (!o || o.mode !== 'user' || !o.user || !Array.isArray(o.trades)) return null;
      o.createdAt = new Date(o.createdAt || Date.now());
      o.trades = o.trades.map((t) => ({ ...t, date: new Date(t.date) }));
      o.snapshots = (o.snapshots || []).map((s) => ({ ...s, date: new Date(s.date) }));
      o.doneActions = new Set(o.doneActions || []);
      o.automations = o.automations || []; o.executions = o.executions || []; o.notifications = o.notifications || [];
      o.chainStats = o.chainStats || { verified: 0 };
      return o;
    } catch (e) { return null; }
  }

  const WS = { demo: demoWorkspace(), user: revive(store.get(KEY)) };
  let mode = store.get(MODE_KEY) === 'demo' || !WS.user ? 'demo' : 'user';
  Object.defineProperty(window, 'TC_STATE', { get: () => WS[mode], configurable: true });
  const S = () => WS[mode];

  function save() {
    if (!WS.user) return;
    if (!store.set(KEY, serialize(WS.user))) {
      if (!save.warned) { save.warned = true; window.UI.toast('Browser storage is unavailable — your journal will not persist after reload', 'warn'); }
    }
  }
  function setMode(m) {
    if (m === 'user' && !WS.user) return;
    mode = m;
    store.set(MODE_KEY, m);
  }
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });

  const NAV = [
    ['dashboard', 'Dashboard', 'dashboard'],
    ['journal', 'Trading Journal', 'journal'],
    ['analytics', 'Analytics', 'analytics'],
    ['insights', 'AI Insights', 'ai'],
    ['blockchain', 'Blockchain', 'chain'],
    ['automation', 'Automation', 'bolt'],
    ['settings', 'Settings', 'settings'],
  ];

  const root = document.getElementById('root');
  let cleanup = null;
  let current = null;

  function parseRoute() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, query] = h.split('?');
    return { name: path || 'landing', query: new URLSearchParams(query || '') };
  }

  function shell(name) {
    const st = S();
    const u = st.user;
    const isDemo = mode === 'demo';
    const unread = st.notifications.filter((n) => n.unread).length;
    const unverified = st.trades.filter((t) => !t.verified).length;
    const activeAuto = st.automations.filter((a) => a.status === 'active').length;
    const avatar = `<span class="avatar" style="${u.avatar ? `background-image:url(${u.avatar})` : ''}">${u.avatar ? '' : esc(window.CHAIN.initials(u.name))}</span>`;
    const M = window.MODEL();
    const pills = {
      journal: unverified ? `<span class="nav-pill badge-amber">${unverified}</span>` : (!isDemo && !st.trades.length ? '<span class="nav-pill badge-blue">Start</span>' : ''),
      automation: activeAuto ? `<span class="nav-pill badge-neutral">${activeAuto}</span>` : '',
      insights: isDemo ? '<span class="nav-pill badge-purple">New</span>' : M.ai.locked ? `<span class="nav-pill badge-neutral">${M.ai.have}/${M.ai.need}</span>` : '<span class="nav-pill badge-purple">Live</span>',
    };
    const banner = isDemo
      ? `<span class="hide-sm">You're viewing the <b>demo workspace</b> with sample data. All blockchain activity is simulated.</span><span class="show-sm">Demo workspace — sample data.</span> <a class="btn btn-sm" style="height:26px" href="#/start">${WS.user ? 'Go to my journal' : 'Start my own journal'}</a>`
      : `<span class="hide-sm">Your journal is saved only in this browser. Blockchain verification &amp; automation are simulated (testnet).</span><span class="show-sm">Saved in this browser · chain simulated.</span>`;
    return `<div class="app" id="app">
      <aside class="sidebar" aria-label="Main navigation">
        <a class="brand" href="#/"><span class="brand-mark">${icon('chain')}</span><span class="brand-name">TradeChain <span>AI</span></span></a>
        <div class="ws-switch">
          <span class="ws-dot" style="background:${isDemo ? 'var(--cyan)' : 'var(--green)'}"></span>
          <div style="min-width:0;flex:1"><div class="dim" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:600">${isDemo ? 'Demo workspace' : 'My workspace'}</div>
            <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(st.portfolio)}</div></div>
          ${isDemo ? `<a class="btn btn-sm" href="#/start" title="${WS.user ? 'Switch to my workspace' : 'Create my workspace'}">${WS.user ? 'Mine' : 'Create'}</a>` : '<a class="btn btn-sm btn-ghost" href="#/dashboard?demo=1" title="View demo workspace">Demo</a>'}
        </div>
        <div class="nav-label">Workspace</div>
        <nav class="nav">
          ${NAV.slice(0, 6).map(([k, l, ic]) => navItem(k, l, ic, name, pills[k] || '')).join('')}
        </nav>
        <div class="nav-label">Account</div>
        <nav class="nav">${navItem('settings', 'Settings', 'settings', name, '')}</nav>
        <div class="sidebar-foot">
          <div class="wallet-mini">
            <div class="row"><span class="muted">Wallet</span><span class="demo-tag" style="font-size:9.5px;padding:2px 7px">Demo</span></div>
            <div class="row"><span style="display:flex;align-items:center;gap:7px;font-weight:600">
              <span class="dot ${u.walletConnected ? 'dot-live' : ''}" style="color:${u.walletConnected ? 'var(--green)' : 'var(--dim)'}"></span>${u.walletConnected ? 'Connected' : 'Disconnected'}</span>
              <span class="mono dim">0x72A…91FC</span></div>
            <div class="dim" style="font-size:11px">Ethereum Testnet · simulated</div>
          </div>
        </div>
      </aside>
      <div class="sidebar-overlay" data-overlay></div>
      <div class="main">
        ${st.demoBanner ? `<div class="demo-banner">${icon('info', 'info-tip')} ${banner} <button data-hide-banner aria-label="Dismiss">${icon('x')}</button></div>` : ''}
        <header class="topbar">
          <button class="icon-btn menu-toggle" data-menu aria-label="Open navigation">${icon('menu')}</button>
          <div class="search input-wrap">${icon('search')}<input class="input" placeholder="Search trades, assets, hashes…" data-global-search aria-label="Search"><span class="kbd">/</span></div>
          <div class="spacer"></div>
          <div class="dropdown">
            <button class="portfolio-select" data-dropdown-trigger aria-label="Select workspace">
              <span class="ps-icon">${icon('briefcase')}</span>
              <span class="ps-text"><small>${isDemo ? 'Demo' : 'Portfolio'}</small><b>${esc(st.portfolio)}</b></span>
              ${icon('chevronDown')}
            </button>
            <div class="dropdown-menu">
              ${WS.user ? `<button class="menu-item" data-switch="user"><span style="flex:1"><div style="color:var(--text)">${esc(WS.user.portfolio)}</div><div class="dim" style="font-size:11.5px">My workspace · ${WS.user.trades.length} trades</div></span>${!isDemo ? `<span class="check">${icon('check')}</span>` : ''}</button>` : ''}
              <button class="menu-item" data-switch="demo"><span style="flex:1"><div style="color:var(--text)">Main Portfolio</div><div class="dim" style="font-size:11.5px">Demo workspace · sample data</div></span>${isDemo ? `<span class="check">${icon('check')}</span>` : ''}</button>
              ${WS.user ? '' : `<div class="menu-sep"></div><a class="menu-item" href="#/start">${icon('plus')} Create my workspace</a>`}
            </div>
          </div>
          <div class="dropdown">
            <button class="icon-btn" data-dropdown-trigger aria-label="Notifications">${icon('bell')}${unread ? `<span class="notif-count">${unread}</span>` : ''}</button>
            <div class="dropdown-menu notif-panel">
              <div class="notif-head"><b>Notifications</b><button class="btn btn-sm btn-ghost" data-mark-read>Mark all as read</button></div>
              <div class="notif-list">${st.notifications.length ? st.notifications.map(notifItem).join('') : '<div class="empty" style="padding:28px">You\'re all caught up.</div>'}</div>
              <div class="notif-foot"><a class="btn btn-sm btn-ghost" href="#/settings">Notification settings</a></div>
            </div>
          </div>
          <div class="dropdown">
            <button class="avatar-btn" data-dropdown-trigger aria-label="Account menu">${avatar}</button>
            <div class="dropdown-menu">
              <div style="padding:10px 10px 8px"><div style="font-weight:600">${esc(u.name)}</div><div class="dim" style="font-size:12px">${esc(u.email || (isDemo ? '' : 'No email set'))}</div></div>
              <div class="menu-sep"></div>
              <a class="menu-item" href="#/settings">${icon('user')} Profile &amp; settings</a>
              ${isDemo ? `<a class="menu-item" href="#/start">${icon('journal')} ${WS.user ? 'Go to my journal' : 'Start my own journal'}</a>` : `<a class="menu-item" href="#/dashboard?demo=1">${icon('eye')} Explore demo workspace</a>`}
              <div class="menu-sep"></div>
              <a class="menu-item" href="#/">${icon('logout')} Back to home</a>
            </div>
          </div>
        </header>
        <main class="content" id="page"></main>
      </div>
    </div>`;
  }

  function navItem(k, label, ic, active, extra) {
    return `<a class="nav-item ${k === active ? 'active' : ''}" href="#/${k}" ${k === active ? 'aria-current="page"' : ''}>
      <span class="nav-indicator"></span>${icon(ic)}<span>${label}</span>${extra}</a>`;
  }

  function notifItem(n) {
    const map = {
      chain: ['checkCircle', 'var(--green-soft)', 'var(--green)'],
      ai: ['ai', 'var(--purple-soft)', 'var(--purple)'],
      warn: ['alert', 'var(--amber-soft)', 'var(--amber)'],
      auto: ['bolt', 'var(--blue-soft)', 'var(--blue)'],
    };
    const [ic, bg, fg] = map[n.kind] || map.chain;
    return `<div class="notif ${n.unread ? 'unread' : ''}"><span class="notif-ico" style="background:${bg};color:${fg}">${icon(ic)}</span>
      <div class="notif-body"><div>${n.html}</div><div class="notif-time">${n.time}</div></div></div>`;
  }

  function bindShell() {
    const app = document.getElementById('app');
    app.querySelector('[data-menu]').addEventListener('click', () => app.classList.add('nav-open'));
    app.querySelector('[data-overlay]').addEventListener('click', () => app.classList.remove('nav-open'));
    app.querySelectorAll('.nav-item').forEach((a) => a.addEventListener('click', () => app.classList.remove('nav-open')));
    const hb = app.querySelector('[data-hide-banner]');
    if (hb) hb.addEventListener('click', () => { S().demoBanner = false; hb.parentElement.remove(); save(); });
    app.querySelector('[data-mark-read]').addEventListener('click', () => {
      S().notifications.forEach((n) => { n.unread = false; });
      app.querySelectorAll('.notif.unread').forEach((n) => n.classList.remove('unread'));
      const c = app.querySelector('.notif-count'); if (c) c.remove();
      save();
    });
    app.querySelectorAll('[data-switch]').forEach((b) => b.addEventListener('click', () => {
      window.UI.closeDropdowns();
      setMode(b.dataset.switch);
      const { name, query } = parseRoute();
      if (query.get('demo') === '1') location.hash = '#/' + name; // drop the ?demo flag so it doesn't override the switch
      else render(false);
      window.UI.toast(mode === 'demo' ? 'Switched to the demo workspace' : `Switched to <b>${esc(S().portfolio)}</b>`, 'info');
    }));
    const gs = app.querySelector('[data-global-search]');
    gs.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = gs.value.trim().toLowerCase();
      if (!q) return;
      const t = S().trades.find((x) => x.id.toLowerCase() === q || (x.hash && x.hash.toLowerCase().startsWith(q)));
      if (t) { window.JOURNAL.openTradeDetail(t); return; }
      location.hash = '#/journal';
      setTimeout(() => {
        const s = document.querySelector('[data-search]');
        if (s) { s.value = gs.value.trim(); s.dispatchEvent(new Event('input')); }
      }, 50);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      const gs = document.querySelector('[data-global-search]');
      if (gs && gs.offsetParent) { e.preventDefault(); gs.focus(); }
    }
  });

  function render(keepScroll) {
    const { name, query } = parseRoute();
    // Workspace routing
    if (name === 'start') {
      if (WS.user && query.get('new') !== '1') { setMode('user'); location.replace('#/dashboard'); return; }
    } else if (query.get('demo') === '1') {
      setMode('demo');
    }
    const target = window.PAGES[name] ? name : (name === 'landing' ? 'landing' : 'dashboard');
    const p = window.PAGES[target];
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    window.UI.destroyCharts();
    window.UI.tip(null);
    const y = window.scrollY;
    if (p.shell === false) {
      root.innerHTML = p.render();
      document.title = p.title ? `${p.title} · TradeChain AI` : 'TradeChain AI — Analyze. Verify. Trade Smarter.';
      cleanup = p.mount(root) || null;
    } else {
      root.innerHTML = shell(target);
      bindShell();
      const el = document.getElementById('page');
      el.innerHTML = p.render();
      document.title = `${p.title} · TradeChain AI`;
      cleanup = p.mount(el) || null;
      window.UI.countUp(el);
      window.UI.animateRings(el);
      if (query.get('demo') === '1' && target === 'dashboard' && !keepScroll && current !== target) {
        window.UI.toast('Demo workspace — sample data, changes are not saved', 'info');
      }
    }
    if (keepScroll) window.scrollTo(0, y); else if (current !== target) window.scrollTo(0, 0);
    current = target;
  }

  window.APP = {
    refresh: () => { save(); render(true); },
    save,
    get mode() { return mode; },
    hasUser: () => !!WS.user,
    createUser(profile) {
      WS.user = newUserWorkspace(profile);
      setMode('user');
      save();
    },
    resetUser() {
      WS.user = null;
      store.del(KEY);
      setMode('demo');
    },
  };
  window.UI.chartDefaults();
  window.addEventListener('hashchange', () => render(false));
  render(false);
})();
