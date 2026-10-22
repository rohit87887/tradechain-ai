/* ==========================================================================
   TradeChain AI — Dashboard, Trading Journal, trade modals
   ========================================================================== */
(function () {
  'use strict';
  const D = window.TC_DATA;
  const { icon, inr, pct, price, fmtDate, fmtTime, shortHash, esc, assetIcon, sparkline } = window.UI;
  const PAGES = (window.PAGES = window.PAGES || {});
  const S = () => window.TC_STATE;

  /* ======================================================================
     Dashboard
     ====================================================================== */
  function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }
  const isUser = () => S().mode === 'user';

  function statCard({ label, valueHtml, ico, color, foot, spark, sparkColor }) {
    return `<div class="card stat-card">
      <div class="stat-top">
        <div class="stat-label"><span class="stat-ico" style="background:var(--${color}-soft);color:var(--${color})">${icon(ico)}</span>${label}</div>
      </div>
      <div class="stat-value">${valueHtml}</div>
      <div class="stat-foot">${foot}</div>
      ${spark && spark.length > 1 ? `<div class="stat-spark">${sparkline(spark, sparkColor)}</div>` : ''}
    </div>`;
  }

  function tradeRow(t, compact) {
    const pnlCls = t.pnl >= 0 ? 'pos' : 'neg';
    return `<tr class="clickable" data-trade="${t.id}">
      <td><div class="asset-cell">${assetIcon(t.asset)}<div><div class="an">${esc(t.asset)}</div><div class="aid">${t.id}</div></div></div></td>
      <td><span class="type-badge ${t.type.toLowerCase()}">${t.type}</span></td>
      <td class="num">${price(t.asset, t.entry)}</td>
      <td class="num">${price(t.asset, t.exit)}</td>
      <td class="num ${pnlCls}" style="font-weight:600">${inr(t.pnl, { sign: true })}</td>
      ${compact ? '' : `<td><span class="badge badge-neutral">${esc(t.strategy)}</span></td>`}
      ${compact ? '' : `<td class="muted">${fmtDate(t.date)}<span class="dim"> · ${fmtTime(t.date)}</span></td>`}
      <td>${statusBadge(t)}</td>
    </tr>`;
  }
  function statusBadge(t) {
    return t.verified
      ? `<span class="badge badge-green">${icon('check')} Verified</span>`
      : `<span class="badge badge-amber">${icon('alert')} Unverified</span>`;
  }

  function equityCard(id, M) {
    return `<div class="card" id="${id}">
      <div class="card-head">
        <div><div class="card-title">Portfolio Performance</div><div class="card-sub">${M.mode === 'user' ? `Equity curve · starting capital ${inr(M.portfolio.start)}` : 'Equity curve · all accounts'}</div></div>
        <div class="segmented" data-range>
          ${M.ranges.map((r) => `<button data-r="${r}" class="${r === M.defaultRange ? 'active' : ''}">${r}</button>`).join('')}
        </div>
      </div>
      <div class="chart-stats" style="margin-top:14px">
        <div><div class="cs-label">Starting Value</div><div class="cs-value" data-eq-start>—</div></div>
        <div><div class="cs-label">Current Value</div><div class="cs-value" data-eq-cur>—</div></div>
        <div><div class="cs-label">Total Return</div><div class="cs-value" data-eq-ret>—</div></div>
        <div class="hide-sm"><div class="cs-label">Period High</div><div class="cs-value" data-eq-high>—</div></div>
      </div>
      <div class="card-body"><div class="chart-wrap" style="height:320px"><canvas></canvas>
        ${M.empty ? `<div class="chart-empty"><div>${icon('activity')}<div style="font-weight:600;color:var(--text)">Your equity curve starts here</div><div class="muted" style="font-size:13px">It updates automatically as you log trades.</div></div></div>` : ''}
      </div></div>
    </div>`;
  }

  function mountEquity(card, M) {
    const canvas = card.querySelector('canvas');
    let chart = null;
    let cur = { dates: [], fmt: 'date' };
    function labelFor(d, fmt) {
      if (fmt === 'time') return fmtTime(d);
      return fmtDate(d, true);
    }
    function tickFor(d, fmt) {
      if (!d) return '';
      if (fmt === 'time') return fmtTime(d).replace(':00', '');
      return fmtDate(d);
    }
    function render(r) {
      const s = M.equitySeries(r);
      const start = s.values[0], now = s.values[s.values.length - 1];
      cur = s;
      const ret = Math.trunc(((now - start) / start) * 10000) / 100;
      const color = ret >= 0 ? '#1fc77e' : '#f0516a';
      card.querySelector('[data-eq-start]').textContent = inr(Math.round(start));
      card.querySelector('[data-eq-cur]').textContent = inr(Math.round(now));
      const retEl = card.querySelector('[data-eq-ret]');
      retEl.textContent = `${inr(Math.round(now - start), { sign: true })} (${pct(ret)})`;
      retEl.className = 'cs-value ' + (ret > 0 ? 'pos' : ret < 0 ? 'neg' : '');
      card.querySelector('[data-eq-high]').textContent = inr(Math.round(Math.max(...s.values)));
      const labels = s.dates.map((d) => labelFor(d, s.fmt));
      const pointR = s.values.length <= 40 ? 2.5 : 0;
      if (chart) {
        const ds = chart.data.datasets[0];
        chart.data.labels = labels;
        ds.data = s.values; ds.borderColor = color; ds._color = color; ds.pointRadius = pointR; ds.pointBackgroundColor = color;
        chart.data.datasets[1].data = s.values.map(() => start);
        chart.update();
        return;
      }
      chart = window.UI.makeChart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: s.values, borderColor: color, _color: color, borderWidth: 2, pointRadius: pointR, pointBackgroundColor: color, pointHoverRadius: 0, tension: 0.25, fill: true,
            backgroundColor: (ctx) => {
              const { chart: c } = ctx; if (!c.chartArea) return 'transparent';
              return window.UI.gradient(c.ctx, c.chartArea, c.data.datasets[0]._color, 0.22, 0);
            },
          }, {
            data: s.values.map(() => start), borderColor: 'rgba(255,255,255,0.18)', borderDash: [4, 5], borderWidth: 1, pointRadius: 0, fill: false, tension: 0,
          }],
        },
        options: {
          interaction: { mode: 'index', intersect: false },
          plugins: {
            crosshair: true,
            tooltip: {
              filter: (item) => item.datasetIndex === 0,
              callbacks: {
                title: (items) => items[0].label,
                label: (item) => {
                  const v = item.raw; const st = item.chart.data.datasets[1].data[0];
                  const ch = ((v - st) / st) * 100;
                  return [`Value  ${inr(Math.round(v))}`, `Change ${inr(Math.round(v - st), { sign: true })} (${pct(ch)})`];
                },
              },
            },
          },
          scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 7, maxRotation: 0, autoSkip: true, callback: (v, i) => tickFor(cur.dates[i], cur.fmt) } },
            y: { position: 'right', grid: { color: 'rgba(255,255,255,0.045)' }, border: { display: false }, grace: '2%', ticks: { maxTicksLimit: 6, callback: (v) => window.UI.inrCompact(v) } },
          },
        },
      });
    }
    card.querySelectorAll('[data-range] button').forEach((b) => b.addEventListener('click', () => {
      card.querySelectorAll('[data-range] button').forEach((x) => x.classList.toggle('active', x === b));
      render(b.dataset.r);
    }));
    render(M.defaultRange);
  }

  /* ---------- Getting-started checklist (new users) ---------- */
  function checklist(st, M) {
    const n = st.trades.length;
    const steps = [
      ['Create your workspace', 'Done — welcome aboard!', true, null],
      ['Log your first trade', 'Record entry, exit, size, setup and emotion.', n >= 1, '<button class="btn btn-sm btn-primary" data-add-trade>Add trade</button>'],
      ['Verify a trade on the blockchain', 'Anchor a trade hash on the simulated testnet.', M.chain.verified >= 1, '<a class="btn btn-sm" href="#/journal">Open journal</a>'],
      ['Log 5 trades to unlock AI insights', `${Math.min(n, 5)} of 5 trades logged.`, n >= 5, `<div class="progress" style="width:90px"><span data-w="${Math.min(n, 5) * 20}%" style="background:var(--grad-ai)"></span></div>`],
      ['Create your first automation', 'Turn a rule into a simulated smart contract.', st.automations.length >= 1, '<a class="btn btn-sm" href="#/automation">Automation</a>'],
      ['Publish a portfolio snapshot', 'Anchor your whole journal as one Merkle root.', st.snapshots.length >= 1, '<a class="btn btn-sm" href="#/blockchain">Blockchain</a>'],
    ];
    const done = steps.filter((s) => s[2]).length;
    if (done === steps.length || st.checklistHidden) return '';
    return `<div class="card checklist">
      <div class="card-head">
        <div><div class="card-title">Get started with TradeChain AI</div><div class="card-sub">${done} of ${steps.length} complete</div></div>
        <div style="display:flex;align-items:center;gap:12px"><div class="progress hide-sm" style="width:160px"><span data-w="${(done / steps.length) * 100}%" style="background:var(--grad-chain)"></span></div>
          <button class="btn btn-sm btn-ghost" data-hide-checklist>Hide</button></div>
      </div>
      <div class="checklist-grid">
        ${steps.map(([t, d, ok, cta], i) => `<div class="cl-step ${ok ? 'done' : ''}">
          <span class="cl-num">${ok ? icon('check') : i + 1}</span>
          <div style="flex:1;min-width:0"><div class="cl-title">${t}</div><div class="cl-desc">${d}</div></div>
          ${ok ? '' : cta || ''}
        </div>`).join('')}
      </div>
    </div>`;
  }

  function emptyState(ic, title, text, cta) {
    return `<div class="empty">${icon(ic)}<div style="font-weight:600;color:var(--text);margin-bottom:4px">${title}</div><div style="font-size:13px">${text}</div>${cta ? `<div style="margin-top:14px">${cta}</div>` : ''}</div>`;
  }
  function sortedTrades(st) {
    return st.mode === 'user' ? st.trades.slice().sort((a, b) => b.date - a.date) : st.trades;
  }

  PAGES.dashboard = {
    title: 'Dashboard',
    render() {
      const st = S();
      const M = window.MODEL();
      const p = M.portfolio;
      const user = isUser();
      const unverified = st.trades.filter((t) => !t.verified).length;
      const activeAuto = st.automations.filter((a) => a.status === 'active').length;
      const up = (v) => (v >= 0 ? 'up' : 'down');
      const arrow = (v) => icon(v >= 0 ? 'arrowUp' : 'arrowDown');
      const ai = M.ai;
      const cl = user ? checklist(st, M) : '';
      return `<div class="page">
        <div class="page-head">
          <div>
            <h1 class="page-title">${M.empty ? 'Welcome' : greeting()}, ${esc(st.user.greetName)} 👋</h1>
            <p class="page-sub">${M.empty ? 'Your journal is ready. Log your first trade and TradeChain AI takes it from there.' : "Here's your trading performance overview."}</p>
          </div>
          <div class="page-actions">
            ${M.empty ? `<button class="btn" data-import-trades>${icon('upload')} Import CSV</button>` : `<a class="btn" href="#/insights">${icon('ai')} AI Review</a>`}
            <button class="btn btn-primary" data-add-trade>${icon('plus')} ${M.empty ? 'Log First Trade' : 'Add Trade'}</button>
          </div>
        </div>

        ${cl}

        <div class="grid grid-4 ${cl ? 'mt' : ''}">
          ${statCard({ label: 'Portfolio Value', ico: 'wallet', color: 'blue', valueHtml: `<span data-count="${Math.abs(Math.round(p.value))}" data-inr="1" data-prefix="${p.value < 0 ? '-' : ''}₹">₹0</span>`,
            foot: M.empty ? '<span>Starting capital</span>' : `<span class="${p.change >= 0 ? 'pos' : 'neg'}" style="font-weight:600">${inr(Math.round(p.change), { sign: true })}</span><span class="delta ${up(p.change)}">${arrow(p.change)}${pct(p.changePct)}</span>`,
            spark: M.empty ? null : M.sparks.value, sparkColor: '#5b8cff' })}
          ${statCard({ label: "Today's P&L", ico: 'activity', color: 'green', valueHtml: `<span class="${p.todayPnl > 0 ? 'pos' : p.todayPnl < 0 ? 'neg' : ''}">${inr(Math.round(p.todayPnl), { sign: true })}</span>`,
            foot: user && !p.todayPnl ? '<span>No closed trades today</span>' : `<span class="delta ${up(p.todayPnl)}">${arrow(p.todayPnl)}${pct(p.todayPct)}</span><span>vs. ${user ? 'start of day' : 'yesterday close'}</span>`,
            spark: user && !p.todayPnl ? null : M.sparks.today, sparkColor: p.todayPnl >= 0 ? '#1fc77e' : '#f0516a' })}
          ${statCard({ label: 'Win Rate', ico: 'target', color: 'purple', valueHtml: M.empty ? '<span class="dim">—</span>' : `<span data-count="${M.winRate.toFixed(1)}" data-dec="1" data-suffix="%">0%</span>`,
            foot: M.winFoot, spark: M.sparks.win, sparkColor: '#9b7bff' })}
          ${statCard({ label: 'Maximum Drawdown', ico: 'trendDown', color: 'amber', valueHtml: `<span data-count="${M.maxDD.toFixed(1)}" data-dec="1" data-suffix="%">0%</span>`,
            foot: M.ddFoot, spark: M.sparks.dd, sparkColor: '#f5a524' })}
        </div>

        <div class="card pipeline mt">
          ${[
            ['journal', 'blue', 'Record', `${M.tradeCount} trade${M.tradeCount === 1 ? '' : 's'}`, '#/journal'],
            ['ai', 'purple', 'Analyze with AI', ai.locked ? `${ai.have}/${ai.need} to unlock` : `Score ${ai.score}/100`, '#/insights'],
            ['analytics', 'green', 'Measure', `${pct(p.changePct)} return`, '#/analytics'],
            ['shield', 'cyan', 'Verify', `${M.chain.verified} on-chain`, '#/blockchain'],
            ['bolt', 'amber', 'Automate', `${activeAuto} active rule${activeAuto === 1 ? '' : 's'}`, '#/automation'],
          ].map(([ic, c, l, v, href]) => `<a class="pipe-step" href="${href}">
              <span class="pipe-num" style="background:${c === 'cyan' ? 'rgba(56,198,232,0.12)' : `var(--${c}-soft)`};color:var(--${c})">${icon(ic)}</span>
              <span><small>${l}</small><b>${v}</b></span></a>`).join('')}
        </div>

        <div class="grid grid-main mt">
          ${equityCard('eq-card', M)}
          <div class="stack">
            <div class="card card-pad">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                <div class="card-title">AI Snapshot</div><span class="ai-badge">${icon('ai')} ${ai.locked ? 'Learning' : user ? 'Live' : 'Updated 2m ago'}</span>
              </div>
              ${ai.locked ? `
                <div class="mini-score">
                  ${window.UI.ring((ai.have / ai.need) * 100, 92, 9, null, `<div><div style="font-size:22px;font-weight:700">${ai.have}/${ai.need}</div><div class="dim" style="font-size:10.5px">trades</div></div>`)}
                  <div><div style="font-weight:600;font-size:15px">AI insights locked</div>
                  <div class="muted" style="font-size:12.5px;margin-top:4px">Log ${ai.need - ai.have} more trade${ai.need - ai.have === 1 ? '' : 's'} to unlock your AI score, best setups and risk warnings.</div></div>
                </div>
                <button class="btn btn-sm" data-add-trade style="margin-top:16px;width:100%">${icon('plus')} Log a trade</button>`
              : `
                <div class="mini-score">
                  ${window.UI.ring(ai.score, 92, 9, null, `<div><div style="font-size:24px;font-weight:700;letter-spacing:-0.03em">${ai.score}</div><div class="dim" style="font-size:10.5px">/ 100</div></div>`)}
                  <div>
                    <div style="font-weight:600;font-size:15px">${ai.label}</div>
                    <div class="muted" style="font-size:12.5px;margin-top:4px">${ai.snapshotSub}</div>
                  </div>
                </div>
                <div style="margin-top:16px;padding:12px;border-radius:12px;background:var(--surface);border:1px solid var(--border);font-size:13px;color:var(--text-2)">${ai.snapshot}</div>
                <a class="btn btn-sm btn-ghost" href="#/insights" style="margin-top:10px;padding:0">View all insights ${icon('arrowRight')}</a>`}
            </div>
            <div class="card card-pad">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
                <div class="card-title">Record Integrity</div><span class="demo-tag">Testnet</span>
              </div>
              <div style="display:flex;align-items:baseline;gap:8px"><span style="font-size:28px;font-weight:700;letter-spacing:-0.03em">${M.chain.verified}</span><span class="muted">of ${M.chain.total} trade${M.chain.total === 1 ? '' : 's'} verified</span></div>
              <div class="progress" style="margin:12px 0"><span data-w="${M.chain.rate}%" style="background:var(--grad-chain)"></span></div>
              <div style="display:flex;justify-content:space-between;font-size:12.5px" class="muted">
                <span>${unverified ? `${unverified} pending verification` : M.chain.total ? 'All records anchored' : 'Nothing to verify yet'}</span><span class="mono">#${M.blockNow.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-main mt">
          <div class="card">
            <div class="card-head">
              <div><div class="card-title">Recent Trades</div><div class="card-sub">Latest entries from your journal</div></div>
              <a class="btn btn-sm" href="#/journal">View journal ${icon('arrowRight')}</a>
            </div>
            ${st.trades.length ? `<div class="table-wrap" style="margin-top:12px">
              <table class="table">
                <thead><tr><th>Asset</th><th>Type</th><th class="num">Entry</th><th class="num">Exit</th><th class="num">P&amp;L</th><th>Status</th></tr></thead>
                <tbody>${sortedTrades(st).slice(0, 6).map((t) => tradeRow(t, true)).join('')}</tbody>
              </table>
            </div>` : emptyState('journal', 'No trades yet', 'Your most recent trades will show up here.', `<button class="btn btn-primary btn-sm" data-add-trade>${icon('plus')} Add your first trade</button>`)}
          </div>
          <div class="card">
            ${M.allocation ? `
            <div class="card-head"><div><div class="card-title">${M.allocation.title}</div><div class="card-sub">${M.allocation.sub}</div></div></div>
            <div class="card-body">
              <div class="chart-wrap" style="height:180px"><canvas id="alloc-chart"></canvas>
                <div style="position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;text-align:center">
                  <div><div class="muted" style="font-size:11px">${M.allocation.centerLabel}</div><div style="font-weight:700;font-size:17px">${M.allocation.centerValue}</div></div>
                </div>
              </div>
              <div style="margin-top:14px">
                ${M.allocation.items.map((a) => `<div class="list-row" style="padding:8px 0">
                  <span class="dot" style="color:${a.color}"></span><span style="flex:1">${esc(a.name)}</span>
                  <span class="muted">${inr(a.amount)}</span><b style="width:42px;text-align:right">${a.value}%</b></div>`).join('')}
              </div>
            </div>` : `<div class="card-head"><div><div class="card-title">Volume by Asset</div><div class="card-sub">Notional traded per instrument</div></div></div>
              ${emptyState('analytics', 'No volume yet', 'See where your capital goes once you log trades.')}`}
          </div>
        </div>
      </div>`;
    },
    mount(root) {
      const M = window.MODEL();
      mountEquity(root.querySelector('#eq-card'), M);
      if (M.allocation) {
        window.UI.makeChart(root.querySelector('#alloc-chart'), {
          type: 'doughnut',
          data: { labels: M.allocation.items.map((a) => a.name), datasets: [{ data: M.allocation.items.map((a) => a.value), backgroundColor: M.allocation.items.map((a) => a.color), borderColor: '#0d1119', borderWidth: 3, hoverOffset: 6 }] },
          options: { cutout: '74%', plugins: { tooltip: { callbacks: { label: (i) => `${i.label}: ${i.raw}%` } } } },
        });
      }
      bindTradeRows(root);
      root.querySelectorAll('[data-add-trade]').forEach((b) => b.addEventListener('click', () => openAddTrade()));
      const imp = root.querySelector('[data-import-trades]');
      if (imp) imp.addEventListener('click', openImport);
      const hide = root.querySelector('[data-hide-checklist]');
      if (hide) hide.addEventListener('click', () => { S().checklistHidden = true; window.APP.refresh(); });
    },
  };

  /* ======================================================================
     Trading Journal
     ====================================================================== */
  PAGES.journal = {
    title: 'Trading Journal',
    render() {
      const st = S();
      const strategies = [...new Set([...D.STRATEGIES, ...st.trades.map((t) => t.strategy)])];
      if (!st.trades.length) {
        return `<div class="page">
          <div class="page-head">
            <div><h1 class="page-title">Trading Journal</h1><p class="page-sub">Every trade, its context and its on-chain proof.</p></div>
          </div>
          <div class="card onboard-empty">
            <div class="oe-art">${icon('journal')}</div>
            <h2 style="font-size:22px;letter-spacing:-0.02em">Start your trading journal</h2>
            <p class="muted" style="max-width:480px;margin:8px auto 0">Log trades manually or import a CSV from your broker or exchange. Every metric, chart and AI insight is calculated from what you record here.</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:22px;flex-wrap:wrap">
              <button class="btn btn-primary btn-lg" data-add-trade>${icon('plus')} Add your first trade</button>
              <button class="btn btn-lg" data-import-trades>${icon('upload')} Import CSV</button>
            </div>
            <div class="grid grid-3" style="margin-top:34px;text-align:left">
              ${[['target', 'blue', 'Record the setup', 'Strategy, stop loss and take profit let the AI measure your risk/reward.'],
                ['ai', 'purple', 'Tag your emotion', 'Calm, FOMO, Greedy… after 5 trades the AI shows how emotions affect results.'],
                ['shield', 'green', 'Verify on-chain', 'Hash each record so you can prove it was never edited (testnet simulation).']]
                .map(([ic, c, t, d]) => `<div class="tip"><span class="stat-ico" style="background:var(--${c}-soft);color:var(--${c})">${icon(ic)}</span><div><div style="font-weight:600">${t}</div><div class="muted" style="font-size:13px;margin-top:2px">${d}</div></div></div>`).join('')}
            </div>
          </div>
        </div>`;
      }
      return `<div class="page">
        <div class="page-head">
          <div><h1 class="page-title">Trading Journal</h1><p class="page-sub">Every trade, its context and its on-chain proof.</p></div>
          <div class="page-actions">
            <button class="btn" data-import-trades>${icon('upload')} Import Trades</button>
            <button class="btn" data-export>${icon('download')} Export</button>
            <button class="btn btn-primary" data-add-trade>${icon('plus')} Add Trade</button>
          </div>
        </div>
        <div class="summary-strip" data-summary></div>
        <div class="card">
          <div class="toolbar">
            <div class="input-wrap">${icon('search')}<input class="input" type="search" placeholder="Search asset..." data-search aria-label="Search asset"></div>
            <div class="segmented" data-filter>
              ${['All', 'Winning', 'Losing', 'Verified', 'Unverified'].map((f, i) => `<button class="${i === 0 ? 'active' : ''}" data-f="${f}">${f}</button>`).join('')}
            </div>
            <select class="select" data-strategy style="width:auto;height:36px;margin-left:auto" aria-label="Strategy">
              <option value="">All strategies</option>
              ${strategies.map((s) => `<option>${esc(s)}</option>`).join('')}
            </select>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Asset</th><th>Type</th><th class="num">Entry</th><th class="num">Exit</th><th class="num">P&amp;L</th><th>Strategy</th><th>Date</th><th>Status</th></tr></thead>
              <tbody data-rows></tbody>
            </table>
          </div>
          <div class="table-foot" data-foot></div>
        </div>
      </div>`;
    },
    mount(root) {
      root.querySelectorAll('[data-add-trade]').forEach((b) => b.addEventListener('click', () => openAddTrade()));
      root.querySelectorAll('[data-import-trades]').forEach((b) => b.addEventListener('click', openImport));
      if (!S().trades.length) return;
      const f = { q: '', filter: 'All', strategy: '' };
      const rows = root.querySelector('[data-rows]');
      function apply() {
        const st = S();
        const list = sortedTrades(st).filter((t) => {
          if (f.q && !t.asset.toLowerCase().includes(f.q) && !t.id.toLowerCase().includes(f.q)) return false;
          if (f.strategy && t.strategy !== f.strategy) return false;
          if (f.filter === 'Winning') return t.pnl > 0;
          if (f.filter === 'Losing') return t.pnl < 0;
          if (f.filter === 'Verified') return t.verified;
          if (f.filter === 'Unverified') return !t.verified;
          return true;
        });
        rows.innerHTML = list.length ? list.map((t) => tradeRow(t)).join('')
          : `<tr><td colspan="8"><div class="empty">${icon('search')}<div>No trades match your filters.</div></div></td></tr>`;
        if (st.lastAdded) {
          st.lastAdded.split(',').forEach((id) => { const r = rows.querySelector(`[data-trade="${id}"]`); if (r) r.classList.add('row-new'); });
          st.lastAdded = null;
        }
        const net = list.reduce((a, t) => a + t.pnl, 0);
        const wins = list.filter((t) => t.pnl > 0).length;
        const ver = list.filter((t) => t.verified).length;
        root.querySelector('[data-summary]').innerHTML = `
          <div class="card"><div class="muted" style="font-size:12px">Trades shown</div><div class="sv">${list.length}</div></div>
          <div class="card"><div class="muted" style="font-size:12px">Net P&amp;L</div><div class="sv ${net >= 0 ? 'pos' : 'neg'}">${inr(net, { sign: true })}</div></div>
          <div class="card"><div class="muted" style="font-size:12px">Win rate</div><div class="sv">${list.length ? ((wins / list.length) * 100).toFixed(1) : '0.0'}%</div></div>
          <div class="card"><div class="muted" style="font-size:12px">Verified on-chain</div><div class="sv">${ver}<span class="muted" style="font-size:14px;font-weight:500"> / ${list.length}</span></div></div>`;
        root.querySelector('[data-foot]').innerHTML = st.mode === 'user'
          ? `<span>Showing ${list.length} of ${st.trades.length} trades</span><span class="dim">Saved in this browser</span>`
          : `<span>Showing ${list.length} of ${st.trades.length} recent trades · ${D.metrics.totalTrades + st.trades.length - D.trades.length} lifetime</span><span class="demo-tag">Demo data</span>`;
        bindTradeRows(root);
      }
      root.querySelector('[data-search]').addEventListener('input', (e) => { f.q = e.target.value.trim().toLowerCase(); apply(); });
      root.querySelector('[data-strategy]').addEventListener('change', (e) => { f.strategy = e.target.value; apply(); });
      root.querySelectorAll('[data-filter] button').forEach((b) => b.addEventListener('click', () => {
        root.querySelectorAll('[data-filter] button').forEach((x) => x.classList.toggle('active', x === b));
        f.filter = b.dataset.f; apply();
      }));
      root.querySelector('[data-export]').addEventListener('click', exportCsv);
      apply();
    },
  };

  /* ---------- CSV export / import ---------- */
  const CSV_HEAD = ['id', 'asset', 'type', 'entry', 'exit', 'qty', 'pnl_inr', 'strategy', 'date', 'stop_loss', 'take_profit', 'emotion', 'notes', 'verified', 'hash'];
  const csvCell = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  function exportCsv() {
    const lines = [CSV_HEAD.join(',')].concat(sortedTrades(S()).map((t) => [t.id, t.asset, t.type, t.entry, t.exit, t.qty, t.pnl, t.strategy, t.date.toISOString(), t.sl, t.tp, t.emotion, t.notes, t.verified, t.hash].map(csvCell).join(',')));
    download('tradechain-journal.csv', lines.join('\n'));
    window.UI.toast('Exported journal as CSV');
  }
  function download(name, text) {
    const blob = new Blob([text], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function parseCsv(text) {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim()));
  }
  function matchAsset(raw) {
    const v = String(raw || '').trim().toUpperCase();
    const keys = Object.keys(D.ASSETS);
    const base = v.replace(/[-/]?(USDT|USD|INR)$/, '');
    return keys.find((k) => k.toUpperCase() === v) || keys.find((k) => k.toUpperCase().replace('/USDT', '') === base) || null;
  }
  function rowsToTrades(rows) {
    const head = rows[0].map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, ''));
    const col = (...names) => head.findIndex((h) => names.includes(h));
    const ix = {
      asset: col('asset', 'symbol', 'instrument', 'pair'), type: col('type', 'side', 'direction'),
      entry: col('entry', 'entry_price', 'entryprice', 'buy_price', 'open'), exit: col('exit', 'exit_price', 'exitprice', 'sell_price', 'close'),
      qty: col('qty', 'quantity', 'size', 'amount'), date: col('date', 'time', 'datetime', 'closed_at'),
      strategy: col('strategy', 'setup'), sl: col('stop_loss', 'sl', 'stoploss'), tp: col('take_profit', 'tp', 'takeprofit', 'target'),
      emotion: col('emotion', 'mood'), notes: col('notes', 'note', 'comment'), pnl: col('pnl_inr', 'pnl', 'profit'),
    };
    const ok = [], skipped = [];
    if (ix.asset < 0 || ix.entry < 0 || ix.exit < 0 || ix.qty < 0) return { ok, skipped, error: 'The file needs at least asset, entry, exit and qty columns.' };
    const now = new Date();
    rows.slice(1).forEach((r, i) => {
      const get = (k) => (ix[k] >= 0 ? (r[ix[k]] || '').trim() : '');
      const num = (k) => parseFloat(get(k).replace(/[^0-9.\-]/g, ''));
      const asset = matchAsset(get('asset'));
      const entry = num('entry'), exit = num('exit'), qty = num('qty');
      if (!asset || !(entry > 0) || !(exit > 0) || !(qty > 0)) { skipped.push(i + 2); return; }
      const type = /^s/i.test(get('type')) ? 'SELL' : 'BUY';
      let d = new Date(get('date'));
      if (isNaN(d) || d > now) d = now;
      const pnlRaw = num('pnl');
      const pnl = Number.isFinite(pnlRaw) ? Math.round(pnlRaw) : Math.round((exit - entry) * qty * window.MODEL_UTIL.fx(asset) * (type === 'BUY' ? 1 : -1));
      const emo = D.EMOTIONS.find((e) => e.toLowerCase() === get('emotion').toLowerCase()) || 'Calm';
      ok.push({
        asset, type, entry, exit, qty, pnl, strategy: (get('strategy') || S().user.defaultStrategy).slice(0, 40),
        date: d, sl: num('sl') > 0 ? num('sl') : null, tp: num('tp') > 0 ? num('tp') : null,
        emotion: emo, notes: get('notes').slice(0, 500), verified: false, hash: null, block: null,
      });
    });
    return { ok, skipped };
  }

  function openImport() {
    let parsed = null;
    const m = window.UI.openModal({
      title: 'Import Trades',
      sub: 'Upload a CSV from your broker, exchange or spreadsheet. It is read in your browser — nothing is uploaded.',
      body: `<label class="dropzone" data-drop>
          <input type="file" accept=".csv,text/csv" hidden data-file>
          ${icon('upload')}
          <div style="font-weight:600;color:var(--text)">Drop a CSV here or click to browse</div>
          <div class="muted" style="font-size:12.5px">Columns: asset, type, entry, exit, qty, date · optional: strategy, stop_loss, take_profit, emotion, notes</div>
        </label>
        <div data-result style="margin-top:14px"></div>
        <button class="btn btn-sm btn-ghost" data-template style="margin-top:6px;padding:0">${icon('download')} Download a CSV template</button>`,
      foot: `<button class="btn" data-close>Cancel</button><button class="btn btn-primary" data-do-import disabled>Import trades</button>`,
    });
    const out = m.querySelector('[data-result]');
    const btn = m.querySelector('[data-do-import]');
    const file = m.querySelector('[data-file]');
    const drop = m.querySelector('[data-drop]');
    function fail(msg) {
      btn.disabled = true;
      out.innerHTML = `<div class="result-banner error"><span class="rb-ico">${icon('alert')}</span><div><div style="font-weight:700" class="neg">Nothing to import</div><div class="muted" style="font-size:12.5px">${esc(msg)}</div></div></div>`;
    }
    function read(f) {
      if (!f) return;
      if (f.size > 2 * 1024 * 1024) { fail('File is larger than 2 MB.'); return; }
      const r = new FileReader();
      r.onload = () => {
        const rows = parseCsv(String(r.result));
        parsed = rows.length > 1 ? rowsToTrades(rows) : { ok: [], skipped: [], error: 'The file has no data rows.' };
        if (parsed.error || !parsed.ok.length) { fail(parsed.error || 'No valid rows found — check the asset names and prices.'); return; }
        const net = parsed.ok.reduce((a, t) => a + t.pnl, 0);
        btn.disabled = false; btn.textContent = `Import ${parsed.ok.length} trade${parsed.ok.length === 1 ? '' : 's'}`;
        out.innerHTML = `<div class="result-banner"><span class="rb-ico">${icon('check')}</span><div><div style="font-weight:700" class="pos">${esc(f.name)}: ${parsed.ok.length} valid trade${parsed.ok.length === 1 ? '' : 's'}</div>
          <div class="muted" style="font-size:12.5px">Net P&amp;L ${inr(net, { sign: true })}${parsed.skipped.length ? ` · skipped row${parsed.skipped.length === 1 ? '' : 's'} ${parsed.skipped.slice(0, 8).join(', ')}${parsed.skipped.length > 8 ? '…' : ''}` : ''}</div></div></div>`;
      };
      r.readAsText(f);
    }
    file.addEventListener('change', () => read(file.files[0]));
    ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('over')));
    drop.addEventListener('drop', (e) => { e.preventDefault(); read(e.dataTransfer.files[0]); });
    m.querySelector('[data-template]').addEventListener('click', () => {
      download('tradechain-template.csv', [
        'asset,type,entry,exit,qty,date,strategy,stop_loss,take_profit,emotion,notes',
        'BTC/USDT,BUY,95200,97500,0.01,2026-10-01 10:30,Breakout,94300,97800,Disciplined,Breakout above range high',
        'RELIANCE,SELL,3020,2985,20,2026-10-02 11:15,Reversal,3040,2960,Calm,Rejected at resistance',
      ].join('\n'));
    });
    btn.addEventListener('click', () => {
      if (!parsed || !parsed.ok.length) return;
      const st = S();
      const ids = [];
      parsed.ok.sort((a, b) => a.date - b.date).forEach((t) => { t.id = 'TRD-' + String(st.nextId++).padStart(4, '0'); ids.push(t.id); st.trades.unshift(t); });
      st.lastAdded = ids.join(',');
      st.notifications.unshift({ kind: 'ai', html: `Imported <b>${ids.length} trades</b> — analytics updated`, time: 'Just now', unread: true });
      window.UI.closeModal();
      window.APP.refresh();
      window.UI.toast(`Imported <b>${ids.length}</b> trade${ids.length === 1 ? '' : 's'}`);
    });
  }

  function bindTradeRows(root) {
    root.querySelectorAll('[data-trade]').forEach((tr) => {
      if (tr.$bound) return; tr.$bound = true;
      tr.addEventListener('click', () => {
        const t = S().trades.find((x) => x.id === tr.dataset.trade);
        if (t) openTradeDetail(t);
      });
    });
  }

  /* ---------- Trade detail ---------- */
  function openTradeDetail(t) {
    const usd = D.ASSETS[t.asset] && D.ASSETS[t.asset].cur === '$';
    const canDelete = S().mode === 'user';
    window.UI.openModal({
      title: `${esc(t.asset)} <span class="type-badge ${t.type.toLowerCase()}" style="margin-left:8px;vertical-align:3px">${t.type}</span>`,
      sub: `${t.id} · ${fmtDate(t.date, true)}, ${fmtTime(t.date)}`,
      body: `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
          <div style="font-size:30px;font-weight:700;letter-spacing:-0.03em" class="${t.pnl >= 0 ? 'pos' : 'neg'}">${inr(t.pnl, { sign: true })}</div>
          ${statusBadge(t)}
        </div>
        <div class="kv-grid">
          <div><div class="k">Entry</div><div class="v">${price(t.asset, t.entry)}</div></div>
          <div><div class="k">Exit</div><div class="v">${price(t.asset, t.exit)}</div></div>
          <div><div class="k">Quantity</div><div class="v">${t.qty}</div></div>
          <div><div class="k">Strategy</div><div class="v">${esc(t.strategy)}</div></div>
          <div><div class="k">Stop Loss</div><div class="v neg">${t.sl ? price(t.asset, t.sl) : '—'}</div></div>
          <div><div class="k">Take Profit</div><div class="v pos">${t.tp ? price(t.asset, t.tp) : '—'}</div></div>
          <div><div class="k">Emotion</div><div class="v">${esc(t.emotion || '—')}</div></div>
          <div><div class="k">Settlement</div><div class="v">${usd ? `USD @ ₹${D.USD_INR}` : 'INR'}</div></div>
          <div class="span-2"><div class="k">Notes</div><div class="v" style="font-weight:500;color:var(--text-2)">${esc(t.notes || '—')}</div></div>
          <div class="span-2"><div class="k">Record Hash</div><div class="v mono" style="font-size:12.5px">${t.hash ? t.hash : '<span class="warn">Not yet anchored on-chain</span>'}</div></div>
        </div>`,
      foot: `${canDelete ? `<span class="left"><button class="btn btn-sm btn-ghost btn-danger" data-delete>${icon('x')} Delete trade</button></span>` : ''}
        <button class="btn" data-close>Close</button>
        ${t.verified ? `<button class="btn btn-ai" data-view-proof>${icon('shield')} View Blockchain Proof</button>` : `<button class="btn btn-ai" data-verify-now>${icon('shield')} Verify on Blockchain</button>`}`,
      onMount(m) {
        const vp = m.querySelector('[data-view-proof]');
        if (vp) vp.addEventListener('click', () => window.CHAIN.openProof(t));
        const vn = m.querySelector('[data-verify-now]');
        if (vn) vn.addEventListener('click', () => runTradeVerification(t));
        const del = m.querySelector('[data-delete]');
        if (del) del.addEventListener('click', () => {
          if (!del.dataset.armed) {
            del.dataset.armed = '1';
            del.innerHTML = `${icon('alert')} Click again to delete`;
            return;
          }
          const st = S();
          st.trades = st.trades.filter((x) => x !== t);
          window.UI.closeModal();
          window.APP.refresh();
          window.UI.toast(`Deleted <b>${t.id}</b>`, 'warn');
        });
      },
    });
  }

  /* ---------- Add Trade modal ---------- */
  function openAddTrade() {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const emotions = [['Calm', '😌'], ['Confident', '💪'], ['Disciplined', '🎯'], ['Anxious', '😬'], ['FOMO', '😵'], ['Greedy', '🤑']];
    const st0 = S();
    const markets = st0.mode === 'user' ? st0.user.markets || [] : [];
    const rank = (x) => (markets.length && !markets.includes(D.ASSETS[x].cur === '$' ? 'crypto' : 'india') ? 1 : 0);
    const assets = Object.keys(D.ASSETS).sort((a, b) => rank(a) - rank(b));
    const lastAsset = st0.mode === 'user' && st0.trades.length ? sortedTrades(st0)[0].asset : assets[0];
    window.UI.openModal({
      title: st0.mode === 'user' && !st0.trades.length ? 'Log your first trade' : 'Add Trade',
      sub: 'Log a closed trade to your journal. Optionally anchor its hash on-chain.',
      size: 'lg',
      body: `<form class="form-grid" data-form novalidate>
        <div class="field"><label>Asset</label>
          <select class="select" name="asset">${assets.map((a) => `<option ${a === lastAsset ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
        <div class="field"><label>Buy / Sell</label>
          <div class="toggle-group" data-side><button type="button" class="buy active" data-v="BUY">BUY</button><button type="button" class="sell" data-v="SELL">SELL</button></div></div>
        <div class="field"><label>Entry Price</label><div class="input-prefix"><span data-cur>$</span><input class="input" name="entry" type="number" step="any" min="0" placeholder="Entry"></div></div>
        <div class="field"><label>Exit Price</label><div class="input-prefix"><span data-cur>$</span><input class="input" name="exit" type="number" step="any" min="0" placeholder="Exit"></div></div>
        <div class="field"><label>Quantity</label><input class="input" name="qty" type="number" step="any" min="0" placeholder="Units / lots"></div>
        <div class="field"><label>Date</label><input class="input" name="date" type="date" value="${iso}" max="${iso}"></div>
        <div class="field"><label>Strategy</label>
          <select class="select" name="strategy">${D.STRATEGIES.map((s) => `<option ${s === S().user.defaultStrategy ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label>Stop Loss</label><div class="input-prefix"><span data-cur>$</span><input class="input" name="sl" type="number" step="any" min="0" placeholder="Recommended"></div></div>
        <div class="field"><label>Take Profit</label><div class="input-prefix"><span data-cur>$</span><input class="input" name="tp" type="number" step="any" min="0" placeholder="Optional"></div></div>
        <div class="field"><label>Projected P&amp;L <span class="dim" data-risk-note></span></label><div class="input" data-preview style="display:flex;align-items:center;font-weight:600;background:rgba(255,255,255,0.03)">—</div></div>
        <div class="field span-2"><label>Emotion</label>
          <div class="chip-group" data-emotion>${emotions.map(([e, em], i) => `<button type="button" class="chip ${i === 0 ? 'active' : ''}" data-v="${e}">${em} ${e}</button>`).join('')}</div></div>
        <div class="field span-2"><label>Notes</label><textarea class="textarea" name="notes" maxlength="500" placeholder="Setup, reasoning, what you'd do differently…"></textarea></div>
      </form>`,
      foot: `<span class="left">${icon('lock')} Hashing runs locally · <span class="demo-tag">Testnet sim</span></span>
        <button class="btn" data-save>Save Trade</button>
        <button class="btn btn-ai" data-save-verify>${icon('shield')} Save &amp; Verify on Blockchain</button>`,
      onMount(m) {
        const form = m.querySelector('[data-form]');
        let side = 'BUY', emotion = 'Calm';
        const curEls = m.querySelectorAll('[data-cur]');
        const setCur = () => { const a = D.ASSETS[form.asset.value]; curEls.forEach((c) => { c.textContent = a.cur; }); };
        form.asset.addEventListener('change', () => { setCur(); preview(); });
        m.querySelectorAll('[data-side] button').forEach((b) => b.addEventListener('click', () => {
          side = b.dataset.v;
          m.querySelectorAll('[data-side] button').forEach((x) => x.classList.toggle('active', x === b));
          preview();
        }));
        m.querySelectorAll('[data-emotion] button').forEach((b) => b.addEventListener('click', () => {
          emotion = b.dataset.v;
          m.querySelectorAll('[data-emotion] button').forEach((x) => x.classList.toggle('active', x === b));
        }));
        const pv = m.querySelector('[data-preview]');
        const riskNote = m.querySelector('[data-risk-note]');
        const fxOf = () => window.MODEL_UTIL.fx(form.asset.value);
        function calc() {
          const e = parseFloat(form.entry.value), x = parseFloat(form.exit.value), q = parseFloat(form.qty.value);
          if (!(e > 0 && x > 0 && q > 0)) return null;
          return Math.round((x - e) * q * fxOf() * (side === 'BUY' ? 1 : -1));
        }
        function preview() {
          const v = calc();
          pv.textContent = v === null ? '—' : inr(v, { sign: true });
          pv.style.color = v === null ? '' : v >= 0 ? 'var(--green)' : 'var(--red)';
          const e = parseFloat(form.entry.value), sl = parseFloat(form.sl.value), q = parseFloat(form.qty.value);
          const cap = S().user.capital;
          if (e > 0 && sl > 0 && q > 0 && cap) {
            const r = (Math.abs(e - sl) * q * fxOf() / cap) * 100;
            riskNote.textContent = `· risk ${r.toFixed(2)}% of capital`;
            riskNote.style.color = r > S().user.maxRisk ? 'var(--amber)' : '';
          } else riskNote.textContent = '';
        }
        ['entry', 'exit', 'qty', 'sl'].forEach((n) => form[n].addEventListener('input', () => { form[n].classList.remove('invalid'); preview(); }));
        setCur();

        function collect() {
          let ok = true;
          ['entry', 'exit', 'qty'].forEach((n) => {
            const v = parseFloat(form[n].value);
            if (!(v > 0)) { form[n].classList.add('invalid'); ok = false; }
          });
          if (!ok) { window.UI.toast('Entry, exit and quantity are required', 'warn'); return null; }
          const now = new Date();
          let d = form.date.value ? new Date(form.date.value + 'T' + now.toTimeString().slice(0, 5)) : now;
          if (isNaN(d) || d > now) d = now;
          const st = S();
          return {
            id: 'TRD-' + String(st.nextId++).padStart(4, '0'),
            asset: form.asset.value, type: side,
            entry: parseFloat(form.entry.value), exit: parseFloat(form.exit.value), qty: parseFloat(form.qty.value),
            pnl: calc(), strategy: form.strategy.value, verified: false, date: d, hash: null, block: null,
            sl: parseFloat(form.sl.value) || null, tp: parseFloat(form.tp.value) || null,
            notes: form.notes.value.trim(), emotion,
          };
        }
        m.querySelector('[data-save]').addEventListener('click', () => {
          const t = collect(); if (!t) return;
          addTrade(t);
          if (S().user.autoVerify) { runTradeVerification(t); return; }
          window.UI.closeModal();
          window.UI.toast(`Trade <b>${t.id}</b> saved to journal`);
        });
        m.querySelector('[data-save-verify]').addEventListener('click', () => {
          const t = collect(); if (!t) return;
          addTrade(t);
          runTradeVerification(t);
        });
      },
    });
  }

  function addTrade(t) {
    const st = S();
    st.trades.unshift(t);
    st.lastAdded = t.id;
    if (st.mode === 'user') {
      const n = st.trades.length;
      if (n === 1) st.notifications.unshift({ kind: 'ai', html: 'First trade logged — your equity curve is live 🎉', time: 'Just now', unread: true });
      if (n === 5) {
        st.notifications.unshift({ kind: 'ai', html: '<b>AI insights unlocked!</b> Your performance score is ready.', time: 'Just now', unread: true });
        setTimeout(() => window.UI.toast('<b>AI insights unlocked</b> — see your score on the AI Insights page', 'ai'), 600);
      }
    }
    window.APP.refresh();
  }

  /* ---------- Simulated verification flow ---------- */
  async function runTradeVerification(t) {
    const steps = [
      ['Generating Trade Hash...', 'Hash Generated'],
      ['Submitting to Blockchain...', 'Transaction Submitted'],
      ['Waiting for confirmation...', 'Transaction Confirmed'],
      ['Finalizing record...', '✓ Blockchain Verified'],
    ];
    const m = window.UI.openModal({
      title: 'Blockchain Verification',
      sub: `${t.id} · ${esc(t.asset)} · <span class="demo-tag">Ethereum Testnet · Simulated</span>`,
      size: 'sm',
      body: `<div class="process-steps">${steps.map((s, i) => `
          ${i ? '<div class="p-arrow">↓</div>' : ''}
          <div class="p-step" data-step="${i}">
            <span class="p-ico">${i + 1}</span>
            <div class="p-txt"><div class="p-title">${s[0]}</div><div class="p-meta"></div></div>
          </div>`).join('')}</div>
        <div data-result></div>`,
      foot: `<button class="btn" data-close disabled data-done-btn>Please wait…</button>`,
      dismissible: false,
    });
    const doneBtn = m.querySelector('[data-done-btn]');
    const payload = JSON.stringify({ id: t.id, asset: t.asset, type: t.type, entry: t.entry, exit: t.exit, qty: t.qty, pnl: t.pnl, date: t.date.toISOString() });
    const hash = await window.UI.sha256(payload);
    const tx = '0x' + window.UI.randHex(64);
    const block = window.MODEL_UTIL.blockNow() + Math.floor(Math.random() * 3) + 1;
    const metas = [hash, 'tx ' + shortHash(tx, 10, 6), `Block #${block.toLocaleString('en-US')} · 12 confirmations`, 'Record anchored · integrity 100%'];
    const delays = [1000, 1200, 1300, 700];
    const headBtn = m.querySelector('.modal-head [data-close]');
    if (headBtn) headBtn.disabled = true;
    for (let i = 0; i < steps.length; i++) {
      const el = m.querySelector(`[data-step="${i}"]`);
      if (!el) return;
      el.classList.add('active');
      el.querySelector('.p-ico').innerHTML = '<span class="spinner"></span>';
      await window.UI.sleep(delays[i]);
      el.classList.remove('active'); el.classList.add('done');
      el.querySelector('.p-ico').innerHTML = icon('check');
      el.querySelector('.p-title').textContent = steps[i][1];
      el.querySelector('.p-meta').textContent = metas[i];
    }
    t.verified = true; t.hash = hash; t.block = block; t.tx = tx;
    const st = S();
    st.chainStats.verified += 1;
    st.notifications.unshift({ kind: 'chain', html: `Trade <b>${t.id}</b> verified on blockchain`, time: 'Just now', unread: true });
    m.querySelector('[data-result]').innerHTML = `<div class="result-banner">
        <span class="rb-ico">${icon('shield')}</span>
        <div><div style="font-weight:700;color:var(--green)">✓ Blockchain Verified</div>
        <div class="muted" style="font-size:12.5px">${t.id} is now tamper-evident. Any edit will break the hash match.</div></div></div>`;
    window.UI.setDismissible(true);
    if (headBtn) headBtn.disabled = false;
    doneBtn.disabled = false; doneBtn.textContent = 'Done';
    doneBtn.insertAdjacentHTML('afterend', `<button class="btn btn-ai" data-proof>${icon('eye')} View Proof</button>`);
    m.querySelector('[data-proof]').addEventListener('click', () => window.CHAIN.openProof(t));
    window.APP.refresh();
    window.UI.toast(`<b>${t.id}</b> verified on blockchain (testnet sim)`, 'chain');
  }

  window.JOURNAL = { exportCsv, openAddTrade, openImport, openTradeDetail, runTradeVerification, statusBadge, tradeRow, bindTradeRows, mountEquity, equityCard, emptyState, sortedTrades };
})();
