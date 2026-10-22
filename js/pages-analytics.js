/* ==========================================================================
   TradeChain AI — Analytics & AI Insights (driven by window.MODEL())
   ========================================================================== */
(function () {
  'use strict';
  const { icon, inr, inrCompact, fmtDate } = window.UI;
  const PAGES = (window.PAGES = window.PAGES || {});
  const S = () => window.TC_STATE;

  const G = '#1fc77e', R = '#f0516a', AM = '#f5a524';
  const gridY = { color: 'rgba(255,255,255,0.045)' };
  const noGrid = { display: false };

  function chartCard(id, title, sub, height, extra) {
    return `<div class="card">
      <div class="card-head"><div><div class="card-title">${title}</div><div class="card-sub">${sub}</div></div>${extra || ''}</div>
      <div class="card-body"><div class="chart-wrap" style="height:${height}px"><canvas id="${id}"></canvas></div></div>
    </div>`;
  }
  function lockedPage(title, sub, ic, heading, text, have, need) {
    return `<div class="page">
      <div class="page-head"><div><h1 class="page-title">${title}</h1><p class="page-sub">${sub}</p></div></div>
      <div class="card onboard-empty">
        <div class="oe-art">${icon(ic)}</div>
        <h2 style="font-size:22px;letter-spacing:-0.02em">${heading}</h2>
        <p class="muted" style="max-width:500px;margin:8px auto 0">${text}</p>
        ${need ? `<div style="max-width:320px;margin:22px auto 0"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span class="muted">Progress</span><b>${have} / ${need} trades</b></div>
          <div class="progress" style="height:8px"><span data-w="${(have / need) * 100}%" style="background:var(--grad-ai)"></span></div></div>` : ''}
        <div style="display:flex;gap:10px;justify-content:center;margin-top:24px;flex-wrap:wrap">
          <button class="btn btn-primary btn-lg" data-add-trade>${icon('plus')} Log a trade</button>
          <button class="btn btn-lg" data-import-trades>${icon('upload')} Import CSV</button>
        </div>
        <div style="margin-top:16px"><a class="btn btn-sm btn-ghost" href="#/dashboard?demo=1">${icon('eye')} See what it looks like in the demo</a></div>
      </div>
    </div>`;
  }
  function bindLocked(root) {
    root.querySelectorAll('[data-add-trade]').forEach((b) => b.addEventListener('click', () => window.JOURNAL.openAddTrade()));
    root.querySelectorAll('[data-import-trades]').forEach((b) => b.addEventListener('click', () => window.JOURNAL.openImport()));
    window.UI.animateRings(root);
  }

  /* ======================================================================
     Analytics
     ====================================================================== */
  PAGES.analytics = {
    title: 'Analytics',
    render() {
      const M = window.MODEL();
      if (M.empty) {
        return lockedPage('Analytics', 'Performance, risk and behaviour across your trades.', 'analytics', 'Your analytics will appear here',
          'Win rate, profit factor, Sharpe ratio, drawdown, strategy and asset breakdowns — all calculated automatically from your journal as soon as you log your first trade.', 0, 0);
      }
      const m = M.metrics;
      const tiles = [
        ['Total Trades', m.totalTrades, m.totalSub, ''],
        ['Winning Trades', m.winning, `${m.totalTrades ? ((m.winning / m.totalTrades) * 100).toFixed(1) : 0}% of total`, 'pos'],
        ['Losing Trades', m.losing, `${m.totalTrades ? ((m.losing / m.totalTrades) * 100).toFixed(1) : 0}% of total`, 'neg'],
        ['Win Rate', m.winRate + '%', m.winSub, ''],
        ['Profit Factor', m.pfText, 'Gross profit ÷ gross loss', ''],
        ['Average Win', m.avgWin ? inr(m.avgWin, { sign: true }) : '—', 'Per winning trade', 'pos'],
        ['Average Loss', m.avgLoss ? inr(m.avgLoss, { sign: true }) : '—', 'Per losing trade', 'neg'],
        ['Risk / Reward', m.rrText, m.rrSub, ''],
        ['Sharpe Ratio', m.sharpeText, m.sharpeText === '—' ? 'Needs 20+ days & 5+ trades' : 'Annualised, daily returns', ''],
        ['Maximum Drawdown', m.maxDrawdown + '%', m.ddSub, 'warn'],
      ];
      const r = M.risk;
      const user = M.mode === 'user';
      return `<div class="page">
        <div class="page-head">
          <div><h1 class="page-title">Analytics</h1><p class="page-sub">Performance, risk and behaviour across ${m.totalTrades} trade${m.totalTrades === 1 ? '' : 's'}.</p></div>
          ${user ? `<div class="page-actions"><span class="badge badge-neutral">${icon('refresh')} Updates live from your journal</span></div>`
            : `<div class="page-actions"><div class="segmented" data-period>${['3M', '6M', '1Y', 'All'].map((p) => `<button class="${p === '1Y' ? 'active' : ''}">${p}</button>`).join('')}</div></div>`}
        </div>

        <div class="section-title" style="margin-top:0">Performance Metrics</div>
        <div class="metric-grid">
          ${tiles.map(([l, v, s, c]) => `<div class="card metric"><div class="ml">${l}</div><div class="mv ${c}">${v}</div><div class="ms">${s}</div></div>`).join('')}
        </div>

        <div class="section-title">Charts</div>
        <div class="grid grid-main">
          ${chartCard('ch-monthly', 'Monthly P&amp;L', 'Realised profit & loss by month', 280, `<span class="badge ${m.netPnl >= 0 ? 'badge-green' : 'badge-red'}">Net ${inr(m.netPnl, { sign: true })}</span>`)}
          <div class="card">
            <div class="card-head"><div><div class="card-title">Win / Loss Distribution</div><div class="card-sub">${m.winning} win${m.winning === 1 ? '' : 's'} · ${m.losing} loss${m.losing === 1 ? '' : 'es'}</div></div></div>
            <div class="card-body">
              <div class="chart-wrap" style="height:170px"><canvas id="ch-winloss"></canvas>
                <div style="position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;text-align:center">
                  <div><div style="font-weight:700;font-size:22px">${m.winRate}%</div><div class="muted" style="font-size:11px">win rate</div></div></div>
              </div>
              <div class="chart-wrap" style="height:100px;margin-top:12px"><canvas id="ch-dist"></canvas></div>
            </div>
          </div>
        </div>

        <div class="grid grid-2 mt">
          ${chartCard('ch-strategy', 'Strategy Performance', 'Net P&amp;L and win rate by setup', Math.max(160, M.strategyPerf.length * 46 + 40))}
          ${chartCard('ch-asset', 'Asset Performance', 'Net P&amp;L by instrument', Math.max(160, Math.min(260, M.strategyPerf.length * 46 + 40)))}
        </div>

        <div class="grid grid-main mt">
          <div class="card">
            <div class="card-head"><div><div class="card-title">Trading Frequency</div><div class="card-sub">Trades by weekday and hour (local time)</div></div></div>
            <div class="card-body"><div data-heatmap></div></div>
          </div>
          <div class="card">
            ${r ? `
            <div class="card-head"><div><div class="card-title">${r.title}</div><div class="card-sub">${r.sub}</div></div>
              <span class="badge ${r.over === false ? 'badge-green' : 'badge-amber'}">${r.badge}</span></div>
            <div class="card-body">
              <div class="chart-wrap" style="height:150px"><canvas id="ch-risk"></canvas>
                <div style="position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;text-align:center;padding-top:44px">
                  <div><div style="font-weight:700;font-size:22px" class="${r.over === false ? 'pos' : 'warn'}">${r.total}%</div><div class="muted" style="font-size:11px">${r.centerLabel}</div></div></div>
              </div>
              <div style="margin-top:8px">
                ${r.items.map((x) => `<div style="display:grid;grid-template-columns:70px minmax(0,1fr) 48px;gap:10px;align-items:center;font-size:12.5px;margin-top:9px">
                  <span class="muted">${x.name}</span><div class="progress"><span data-w="${Math.min(100, (x.value / r.scale) * 100)}%" style="background:${x.color}"></span></div><b style="text-align:right">${x.value}%</b></div>`).join('')}
              </div>
            </div>` : `
            <div class="card-head"><div><div class="card-title">Risk per Trade</div><div class="card-sub">Capital at risk, from your stop losses</div></div></div>
            ${window.JOURNAL.emptyState('shield', 'No stop losses recorded', 'Add a stop loss when you log trades to measure how much of your capital each trade risks.')}`}
          </div>
        </div>

        <div class="mt">${chartCard('ch-dd', 'Drawdown', 'Distance from running equity peak (daily close)', 220, `<span class="badge badge-red">Max −${m.maxDrawdown}%</span>`)}</div>
      </div>`;
    },
    mount(root) {
      const M = window.MODEL();
      if (M.empty) { bindLocked(root); return; }
      const m = M.metrics;
      const mk = window.UI.makeChart;
      root.querySelectorAll('[data-period] button').forEach((b) => b.addEventListener('click', () => {
        root.querySelectorAll('[data-period] button').forEach((x) => x.classList.toggle('active', x === b));
        window.UI.toast(`Showing ${b.textContent} — demo dataset covers the last 12 months`, 'info');
      }));
      const mp = M.monthlyPnl;
      mk(root.querySelector('#ch-monthly'), {
        type: 'bar',
        data: { labels: mp.labels, datasets: [{ data: mp.values, backgroundColor: mp.values.map((v) => (v >= 0 ? G : R)), borderRadius: 6, maxBarThickness: 34 }] },
        options: {
          plugins: { tooltip: { callbacks: { title: (i) => `${i[0].label} ${mp.years[i[0].dataIndex]}`, label: (i) => `P&L ${inr(i.raw, { sign: true })}` } } },
          scales: { x: { grid: noGrid, border: { display: false } }, y: { grid: gridY, border: { display: false }, ticks: { callback: (v) => inrCompact(v) } } },
        },
      });
      mk(root.querySelector('#ch-winloss'), {
        type: 'doughnut',
        data: { labels: ['Winning', 'Losing'], datasets: [{ data: [m.winning, m.losing], backgroundColor: [G, R], borderColor: '#0d1119', borderWidth: 3, hoverOffset: 6 }] },
        options: { cutout: '76%', plugins: { tooltip: { callbacks: { label: (i) => `${i.label}: ${i.raw} trades` } } } },
      });
      mk(root.querySelector('#ch-dist'), {
        type: 'bar',
        data: { labels: M.pnlDistribution.labels, datasets: [{ data: M.pnlDistribution.values, backgroundColor: M.pnlDistribution.values.map((_, i) => (i < 3 ? 'rgba(240,81,106,0.75)' : 'rgba(31,199,126,0.75)')), borderRadius: 4 }] },
        options: {
          plugins: { tooltip: { callbacks: { title: (i) => `P&L ${i[0].label}`, label: (i) => `${i.raw} trades` } } },
          scales: { x: { grid: noGrid, border: { display: false }, ticks: { font: { size: 9.5 } } }, y: { display: false } },
        },
      });
      const sp = M.strategyPerf;
      mk(root.querySelector('#ch-strategy'), {
        type: 'bar',
        data: { labels: sp.map((s) => s.name), datasets: [{ data: sp.map((s) => s.pnl), backgroundColor: sp.map((s) => (s.pnl >= 0 ? 'rgba(91,140,255,0.85)' : R)), borderRadius: 6, maxBarThickness: 22, minBarLength: 2 }] },
        options: {
          indexAxis: 'y',
          plugins: { tooltip: { callbacks: { label: (i) => { const s = sp[i.dataIndex]; return [`Net P&L ${inr(s.pnl, { sign: true })}`, `Win rate ${s.winRate}%`, `${s.trades} trade${s.trades === 1 ? '' : 's'}`]; } } } },
          scales: { x: { grid: gridY, border: { display: false }, ticks: { callback: (v) => inrCompact(v) } }, y: { grid: noGrid, border: { display: false }, ticks: { color: '#b4bccc', font: { size: 12 } } } },
        },
      });
      const ap = M.assetPerf;
      mk(root.querySelector('#ch-asset'), {
        type: 'bar',
        data: { labels: ap.map((a) => a.name), datasets: [{ data: ap.map((a) => a.pnl), backgroundColor: ap.map((a) => (a.pnl >= 0 ? G : R)), borderRadius: 6, maxBarThickness: 40, minBarLength: 2 }] },
        options: {
          plugins: { tooltip: { callbacks: { label: (i) => [`Net P&L ${inr(i.raw, { sign: true })}`, `${ap[i.dataIndex].trades} trade${ap[i.dataIndex].trades === 1 ? '' : 's'}`] } } },
          scales: { x: { grid: noGrid, border: { display: false } }, y: { grid: gridY, border: { display: false }, ticks: { callback: (v) => inrCompact(v) } } },
        },
      });
      if (M.risk) {
        mk(root.querySelector('#ch-risk'), {
          type: 'doughnut',
          data: { labels: M.risk.items.map((x) => x.name), datasets: [{ data: M.risk.items.map((x) => x.value), backgroundColor: M.risk.items.map((x) => x.color), borderColor: '#0d1119', borderWidth: 3 }] },
          options: { rotation: -90, circumference: 180, cutout: '72%', plugins: { tooltip: { callbacks: { label: (i) => `${i.label}: ${i.raw}%` } } } },
        });
      }
      mk(root.querySelector('#ch-dd'), {
        type: 'line',
        data: {
          labels: M.drawdown.labels.map((d) => fmtDate(d, true)),
          datasets: [{
            data: M.drawdown.values, borderColor: R, borderWidth: 1.6, pointRadius: M.drawdown.values.length <= 40 ? 2 : 0, pointBackgroundColor: R, tension: 0.2, fill: true,
            backgroundColor: (ctx) => { const c = ctx.chart; if (!c.chartArea) return 'transparent'; const g = c.ctx.createLinearGradient(0, c.chartArea.top, 0, c.chartArea.bottom); g.addColorStop(0, 'rgba(240,81,106,0)'); g.addColorStop(1, 'rgba(240,81,106,0.3)'); return g; },
          }],
        },
        options: {
          interaction: { mode: 'index', intersect: false },
          plugins: { crosshair: true, tooltip: { callbacks: { label: (i) => `Drawdown ${i.raw.toFixed(2)}%` } } },
          scales: { x: { grid: noGrid, border: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 } }, y: { max: 0, suggestedMin: -1, grid: gridY, border: { display: false }, ticks: { callback: (v) => v + '%' } } },
        },
      });
      renderHeatmap(root.querySelector('[data-heatmap]'), M);
      window.UI.animateRings(root);
    },
  };

  function renderHeatmap(el, M) {
    const max = Math.max(1, ...M.frequency.flat());
    const col = (v) => (v === 0 ? 'rgba(255,255,255,0.03)' : `rgba(91,140,255,${0.12 + (v / max) * 0.8})`);
    const hourLbl = (h) => (h === 12 ? '12p' : h > 12 ? (h - 12) + 'p' : h + 'a');
    el.innerHTML = `<div class="heatmap" style="grid-template-columns:38px repeat(${M.hours.length}, minmax(0,1fr))">
        <span></span>${M.hours.map((h) => `<span class="hm-col">${hourLbl(h)}</span>`).join('')}
        ${M.weekdays.map((d, di) => `<span class="hm-label">${d}</span>${M.frequency[di].map((v, hi) => `<span class="hm-cell" style="background:${col(v)}" data-d="${d}" data-h="${M.hours[hi]}" data-v="${v}"></span>`).join('')}`).join('')}
      </div>
      <div class="hm-legend">Less ${[0, 0.25, 0.5, 0.75, 1].map((f) => `<i style="background:${col(Math.round(f * max))}"></i>`).join('')} More</div>`;
    el.querySelectorAll('.hm-cell').forEach((c) => {
      c.addEventListener('mousemove', (e) => {
        const h = +c.dataset.h;
        const lbl = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
        window.UI.tip(`<b>${c.dataset.d}, ${lbl}</b><br>${c.dataset.v} trade${c.dataset.v === '1' ? '' : 's'}`, e);
      });
      c.addEventListener('mouseleave', () => window.UI.tip(null));
    });
  }

  /* ======================================================================
     AI Insights
     ====================================================================== */
  PAGES.insights = {
    title: 'AI Insights',
    render() {
      const M = window.MODEL();
      const ai = M.ai;
      const st = S();
      if (ai.locked) {
        return lockedPage('AI Trading Insights', 'Behavioural and statistical analysis of your journal, refreshed after every trade.', 'ai',
          `Log ${ai.need - ai.have} more trade${ai.need - ai.have === 1 ? '' : 's'} to unlock AI insights`,
          'Once you have 5 trades, TradeChain AI scores your performance, finds your best strategy and trading hours, flags risky habits and writes a weekly summary. Tag emotions and add stop losses for sharper insights.',
          ai.have, ai.need);
      }
      return `<div class="page">
        <div class="page-head">
          <div><h1 class="page-title">AI Trading Insights <span class="ai-badge">${icon('ai')} TradeChain Copilot</span></h1>
            <p class="page-sub">Behavioural and statistical analysis of your journal, refreshed after every trade.</p></div>
          <div class="page-actions"><button class="btn btn-ai" data-rerun>${icon('refresh')} Re-run Analysis</button></div>
        </div>

        <div class="card ai-hero">
          <div style="display:flex;align-items:center;gap:22px">
            ${window.UI.ring(ai.score, 148, 12, null, `<div><div class="score-num">${ai.score}<small> / 100</small></div></div>`)}
          </div>
          <div>
            <div class="muted" style="font-size:12.5px;font-weight:500">AI Performance Score</div>
            <div style="font-size:28px;font-weight:700;letter-spacing:-0.03em;margin-top:4px">${ai.label}</div>
            <p class="muted" style="margin-top:8px;max-width:420px">${ai.blurb}</p>
            <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">${ai.chips.join('')}</div>
          </div>
          <div class="ai-hero-right">
            ${ai.subscores.map((s) => `<div class="subscore"><span class="muted">${s.name}</span>
              <div class="progress"><span data-w="${s.value}%" style="background:${s.value >= 85 ? 'linear-gradient(90deg,#1fc77e,#38c6e8)' : s.value >= 70 ? 'var(--grad-ai)' : 'linear-gradient(90deg,#f5a524,#f0c674)'}"></span></div>
              <span>${s.value}</span></div>`).join('')}
          </div>
        </div>

        <div class="grid grid-4 mt" data-insights>${ai.cards.map(insightCard).join('')}</div>

        <div class="grid grid-main mt">
          <div class="card ai-summary">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:12px">
                <span class="stat-ico" style="background:var(--grad-ai);color:white;width:38px;height:38px;border-radius:11px">${icon('ai')}</span>
                <div><div class="card-title" style="font-size:17px">AI ${M.mode === 'user' ? 'Performance' : 'Weekly'} Summary</div><div class="card-sub">${ai.summaryTitle} · generated by TradeChain Copilot${M.mode === 'user' ? ' (on-device)' : ' (demo)'}</div></div>
              </div>
              <button class="btn btn-sm" data-replay>${icon('refresh')} Regenerate</button>
            </div>
            <div class="typed" data-typed></div>
            <div style="display:flex;gap:24px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);flex-wrap:wrap">
              ${ai.summaryStats.map(([l, v, c]) => `<div><div class="muted" style="font-size:12px">${l}</div><div style="font-weight:650;font-size:17px" class="${c}">${v}</div></div>`).join('')}
            </div>
          </div>
          <div class="card card-pad">
            <div class="card-title">Recommended Actions</div>
            <div class="card-sub" style="margin-bottom:6px">Tick them off as you go</div>
            ${ai.actions.map((a, i) => `<div class="action-item ${st.doneActions.has(a) ? 'done' : ''}" data-action="${i}">
              <button class="action-check" aria-label="Toggle">${icon('check')}</button><div class="at" style="font-size:13.5px">${a}</div></div>`).join('')}
          </div>
        </div>

        <div class="grid grid-2 mt">
          ${chartCard('ch-hourly', 'Win Rate by Hour', 'Your edge across the trading day', 240, `<span class="badge badge-blue">${M.hourlyBadge}</span>`)}
          <div class="card card-pad">
            <div class="card-title">Emotion vs Outcome</div>
            <div class="card-sub" style="margin-bottom:12px">Win rate by emotion tag</div>
            ${M.emotions.map((e) => `
              <div style="display:grid;grid-template-columns:120px minmax(0,1fr) 70px;gap:12px;align-items:center;font-size:13px;margin-top:12px">
                <span>${e.emoji} ${e.name}</span><div class="progress" style="height:8px"><span data-w="${e.winRate}%" style="background:${e.winRate >= 70 ? G : e.winRate >= 50 ? AM : R}"></span></div>
                <span style="text-align:right"><b>${e.winRate}%</b> <span class="dim" style="font-size:11px">${e.count}</span></span></div>`).join('')}
            <div style="margin-top:18px;padding:12px;border-radius:12px;background:${M.emotionNote.tone === 'bad' ? 'var(--red-soft)' : 'var(--green-soft)'};border:1px solid ${M.emotionNote.tone === 'bad' ? 'rgba(240,81,106,0.2)' : 'rgba(31,199,126,0.2)'};font-size:13px;color:var(--text-2)">
              ${icon(M.emotionNote.tone === 'bad' ? 'alert' : 'checkCircle', 'info-tip')} ${M.emotionNote.html}
            </div>
          </div>
        </div>
      </div>`;
    },
    mount(root) {
      const M = window.MODEL();
      if (M.ai.locked) { bindLocked(root); return; }
      window.UI.animateRings(root);
      const typed = root.querySelector('[data-typed]');
      let cancel = typeSummary(typed, M.ai.summary);
      root.querySelector('[data-replay]').addEventListener('click', () => { cancel(); cancel = typeSummary(typed, M.ai.summary); });
      root.querySelector('[data-rerun]').addEventListener('click', async (e) => {
        const btn = e.currentTarget; btn.disabled = true;
        const cards = root.querySelectorAll('[data-insights] .insight-card');
        cards.forEach((c) => c.classList.add('shimmer'));
        btn.innerHTML = `<span class="spinner" style="border-color:rgba(255,255,255,0.3);border-top-color:white"></span> Analyzing ${S().trades.length} trades…`;
        await window.UI.sleep(1600);
        cards.forEach((c) => c.classList.remove('shimmer'));
        btn.disabled = false; btn.innerHTML = `${icon('refresh')} Re-run Analysis`;
        window.UI.toast('AI analysis refreshed from your latest trades', 'ai');
      });
      root.querySelectorAll('[data-action]').forEach((el) => el.querySelector('button').addEventListener('click', () => {
        const key = M.ai.actions[+el.dataset.action];
        const set = S().doneActions;
        set.has(key) ? set.delete(key) : set.add(key);
        el.classList.toggle('done', set.has(key));
        window.APP.save();
      }));
      const hv = M.hourlyWinRate.values;
      window.UI.makeChart(root.querySelector('#ch-hourly'), {
        type: 'bar',
        data: { labels: M.hourlyWinRate.labels, datasets: [{ data: hv, backgroundColor: hv.map((v) => (v === null ? 'transparent' : v >= 70 ? 'rgba(91,140,255,0.9)' : v >= 50 ? 'rgba(91,140,255,0.45)' : 'rgba(255,255,255,0.14)')), borderRadius: 6, maxBarThickness: 28, minBarLength: 3 }] },
        options: {
          plugins: { tooltip: { callbacks: { label: (i) => (i.raw === null ? 'No trades' : `Win rate ${i.raw}%`) } } },
          scales: { x: { grid: noGrid, border: { display: false }, ticks: { maxRotation: 0, autoSkip: true } }, y: { min: 0, max: 100, grid: gridY, border: { display: false }, ticks: { callback: (v) => v + '%' } } },
        },
      });
    },
  };

  function insightCard(c) {
    return `<div class="card insight-card">
      <div class="ic-head"><span class="ic-emoji" style="background:${c.bg}">${c.emoji}</span><div class="ic-kicker">${c.kicker}</div></div>
      <div class="ic-title ${c.accent === 'amber' ? 'warn' : ''}">${c.title}</div>
      <div class="ic-text">${c.text}</div>
      <div class="ic-foot"><span>${c.foot}</span><span class="confidence" title="Model confidence"><span class="dot" style="color:var(--purple)"></span>${c.conf}%</span></div>
    </div>`;
  }

  function typeSummary(el, parts) {
    const tokens = parts.join('').match(/<[^>]+>|[^<]/g);
    let i = 0, out = '', stopped = false;
    el.innerHTML = '<span class="caret"></span>';
    function step() {
      if (stopped || !el.isConnected) return;
      let n = 0;
      while (i < tokens.length && n < 3) { out += tokens[i]; if (tokens[i][0] !== '<') n++; i++; }
      el.innerHTML = out + (i < tokens.length ? '<span class="caret"></span>' : '');
      if (i < tokens.length) setTimeout(step, 14);
    }
    setTimeout(step, 300);
    return () => { stopped = true; };
  }
})();
