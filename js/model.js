/* ==========================================================================
   TradeChain AI — view model
   Demo workspace  -> curated sample numbers from data.js
   User workspace  -> everything computed from the trader's own journal
   ========================================================================== */
(function () {
  'use strict';
  const D = window.TC_DATA;
  const DAY = 86400000;
  const IMPULSIVE = ['FOMO', 'Greedy', 'Anxious'];
  const EMOJI = { Calm: '😌', Confident: '💪', Disciplined: '🎯', Anxious: '😬', FOMO: '😵', Greedy: '🤑' };
  const PALETTE = ['#5b8cff', '#9b7bff', '#1fc77e', '#f5a524', '#38c6e8', '#f0516a', '#e879f9', '#4b5263'];
  const HOUR_LABELS = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sum = (arr, f) => arr.reduce((a, x) => a + (f ? f(x) : x), 0);
  const fx = (asset) => (D.ASSETS[asset] && D.ASSETS[asset].cur === '$' ? D.USD_INR : 1);
  const assetLabel = (a) => a.replace('/USDT', '');
  const assetColor = (a, i) => (D.ASSETS[a] ? D.ASSETS[a].color : PALETTE[i % PALETTE.length]);
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const hourIdx = (d) => clamp(d.getHours(), 9, 21) - 9;
  const weekdayIdx = (d) => (d.getDay() + 6) % 7; // Mon = 0
  const fmtHour = (h) => `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;

  function blockNow() {
    return D.BLOCK_TODAY + Math.max(0, Math.floor((Date.now() - D.NOW.getTime()) / 12000));
  }
  function recentBlocks() {
    const top = blockNow();
    const seed = Math.floor(top / 7);
    return Array.from({ length: 7 }, (_, i) => {
      const n = top - (6 - i) * 3;
      const h = ((n * 2654435761) >>> 0).toString(16).padStart(8, '0');
      return { number: n, hash: `0x${h.slice(0, 4)}…${h.slice(4, 8)}`, txs: 40 + ((n + seed) % 140), age: (6 - i) * 36 + 12 };
    });
  }

  /* ======================================================================
     Demo model (curated)
     ====================================================================== */
  function demoModel(ws) {
    const m = D.metrics;
    const verifiedNow = ws.trades.filter((t) => t.verified).length;
    const verifiedBase = D.trades.filter((t) => t.verified).length;
    const verified = ws.chainStats.verified;
    return {
      mode: 'demo', empty: false, tradeCount: m.totalTrades + (ws.trades.length - D.trades.length),
      portfolio: D.portfolio,
      equitySeries: D.equitySeries,
      ranges: ['1D', '1W', '1M', '3M', '6M', '1Y'], defaultRange: '1Y',
      sparks: {
        value: D.daily.slice(-60).filter((_, i) => i % 2 === 0),
        today: D.equitySeries('1D').values.filter((_, i) => i % 4 === 0),
        win: [61.2, 62.8, 62.1, 63.9, 64.2, 65.8, 65.1, 66.4, 67.0, 66.6, 67.9, 68.4],
        dd: [9.1, 9.4, 8.8, 8.6, 9.0, 8.4, 8.1, 8.3, 7.9, 8.0, 7.8, 7.8],
      },
      winRate: m.winRate, winFoot: '<span class="delta up">↑ 4.2%</span><span>last 30 days</span>',
      maxDD: m.maxDrawdown, ddFoot: '<span class="delta good-down">↓ 1.3%</span><span>vs. last quarter</span>',
      metrics: {
        ...m,
        pfText: m.profitFactor.toFixed(2), sharpeText: m.sharpe.toFixed(2), rrText: m.riskReward, rrSub: 'Planned, median',
        totalSub: 'Last 12 months', ddSub: 'Peak-to-trough, Mar → Apr', winSub: '↑ 4.2% vs prior period',
      },
      monthlyPnl: { labels: D.monthlyPnl.labels, values: D.monthlyPnl.values, years: D.monthlyPnl.labels.map((_, i) => (i >= 2 ? 2026 : 2025)) },
      pnlDistribution: D.pnlDistribution,
      strategyPerf: D.strategyPerf,
      assetPerf: D.assetPerf,
      weekdays: D.weekdays, hours: D.hours, frequency: D.frequency,
      hourlyWinRate: D.hourlyWinRate, hourlyBadge: 'Peak 11 AM · 75%',
      risk: {
        title: 'Risk Exposure', sub: 'Open risk as % of portfolio', centerLabel: 'at risk',
        items: D.riskExposure, total: 6.2, badge: '6.2% / 8% limit', scale: 3,
      },
      allocation: {
        title: 'Allocation', sub: 'By current market value', centerLabel: 'Invested', centerValue: '87%',
        items: D.allocation.map((a) => ({ ...a, amount: Math.round(D.portfolio.value * a.value / 100) })),
      },
      drawdown: { labels: D.dailyDates, values: D.drawdownSeries() },
      emotions: [['Calm', 76, 64], ['Disciplined', 79, 58], ['Confident', 71, 52], ['Anxious', 54, 31], ['Greedy', 46, 22], ['FOMO', 38, 23]]
        .map(([name, winRate, count]) => ({ name, emoji: EMOJI[name], winRate, count })),
      emotionNote: { tone: 'bad', html: 'Trades tagged <b style="color:var(--text)">FOMO</b> lose on 62% of occasions and cost you <b class="neg">−₹7,940</b> this year.' },
      ai: {
        locked: false, score: D.ai.score, label: D.ai.label,
        blurb: 'You have a clear, repeatable edge in breakout setups and respect your stops. Sizing discipline after winning streaks is the main thing holding the score back.',
        chips: ['<span class="badge badge-green">+6 pts this month</span>', `<span class="badge badge-neutral">Based on ${m.totalTrades} trades</span>`],
        subscores: D.ai.subscores,
        cards: [
          { emoji: '🎯', bg: 'var(--green-soft)', kicker: 'Best Strategy', title: 'Breakout Trading', text: 'Your breakout strategy is currently your most profitable strategy.', foot: 'Win Rate: <b class="pos">74%</b>', conf: 94 },
          { emoji: '⚠️', bg: 'var(--amber-soft)', kicker: 'Risk Warning', title: 'Position Sizing', text: 'Your average position size increases after consecutive wins. This may increase portfolio risk.', foot: 'Size +23% after 3 wins', conf: 88, accent: 'amber' },
          { emoji: '🕐', bg: 'var(--blue-soft)', kicker: 'Best Trading Time', title: '10:00 AM – 1:00 PM', text: 'Most of your edge is captured in the late-morning session, before liquidity thins out.', foot: 'Win Rate: <b class="pos">72%</b>', conf: 91 },
          { emoji: '📈', bg: 'var(--purple-soft)', kicker: 'Trading Pattern', title: 'R:R above 1:2', text: 'You perform better when your risk/reward ratio is above 1:2.', foot: 'Win rate 76% vs 58% below 1:2', conf: 86 },
        ],
        snapshot: '🎯 <b style="color:var(--text)">Breakout</b> is your best strategy at <b class="pos">74%</b> win rate. ⚠ Position size creeps up after win streaks.',
        snapshotSub: 'Top 18% of journaled traders in the demo cohort.',
        summaryTitle: 'Week of 29 Sep – 05 Oct 2026',
        summary: D.ai.summary,
        summaryStats: [['Trades', '14', ''], ['Win rate', '71.4%', ''], ['Net P&L', '+₹6,180', 'pos'], ['Best trade', 'TRD-1022', '']],
        actions: D.ai.actions,
      },
      chain: {
        verified, total: m.totalTrades + (ws.trades.length - D.trades.length),
        rate: +(verified / (m.totalTrades + (ws.trades.length - D.trades.length)) * 100).toFixed(1),
        snapshots: D.chainStats.snapshots + ws.snapshots.length, integrity: '100%', extra: verifiedNow - verifiedBase,
      },
      snapshots: [...ws.snapshots, ...D.snapshots],
      recentBlocks: D.recentBlocks,
      executions: D.executions,
      blockNow: D.BLOCK_TODAY,
    };
  }

  /* ======================================================================
     User model (computed)
     ====================================================================== */
  function userModel(ws) {
    const u = ws.user;
    const capital = u.capital || 100000;
    const trades = ws.trades.slice().sort((a, b) => a.date - b.date);
    const n = trades.length;
    const now = new Date();
    const today0 = startOfDay(now);
    const total = sum(trades, (t) => t.pnl);
    const value = capital + total;

    // ---- Daily equity (from the day before account start to today)
    const created = new Date(ws.createdAt || now);
    const first = n ? (trades[0].date < created ? trades[0].date : created) : created;
    const startDay = new Date(startOfDay(first).getTime() - DAY);
    const dates = [], values = [];
    let ti = 0, eq = capital;
    for (let d = new Date(startDay); d <= today0; d = new Date(d.getTime() + DAY)) {
      const end = d.getTime() + DAY;
      while (ti < n && trades[ti].date.getTime() < end) { eq += trades[ti].pnl; ti++; }
      dates.push(d); values.push(eq);
    }
    while (ti < n) { eq += trades[ti].pnl; ti++; } // future-dated trades
    values[values.length - 1] = eq;

    // ---- Intraday (today)
    const todays = trades.filter((t) => t.date >= today0);
    const todayPnl = sum(todays, (t) => t.pnl);
    const sod = value - todayPnl;
    const intraday = { values: [sod], dates: [today0] };
    let run = sod;
    todays.forEach((t) => { run += t.pnl; intraday.values.push(run); intraday.dates.push(t.date); });
    if (intraday.values.length < 2 || intraday.dates[intraday.dates.length - 1] < now) { intraday.values.push(run); intraday.dates.push(now); }

    function equitySeries(range) {
      if (range === '1D') return { ...intraday, fmt: 'time' };
      const len = { '1W': 8, '1M': 31, '3M': 92, '6M': 183, '1Y': 366 }[range] || values.length;
      return { values: values.slice(-len), dates: dates.slice(-len), fmt: 'date' };
    }

    // ---- Trade-sequence stats
    let e = capital, peak = capital, maxDD = 0, wins = 0;
    const winSpark = [], ddSpark = [];
    trades.forEach((t, i) => {
      e += t.pnl; peak = Math.max(peak, e);
      maxDD = Math.max(maxDD, ((peak - e) / peak) * 100);
      if (t.pnl > 0) wins++;
      winSpark.push((wins / (i + 1)) * 100);
      ddSpark.push(((peak - e) / peak) * 100);
    });
    const winners = trades.filter((t) => t.pnl > 0);
    const losers = trades.filter((t) => t.pnl < 0);
    const winRate = n ? (winners.length / n) * 100 : 0;
    const gp = sum(winners, (t) => t.pnl), gl = Math.abs(sum(losers, (t) => t.pnl));
    const pfNum = gl ? gp / gl : gp > 0 ? 3 : 1;
    const avgWin = winners.length ? gp / winners.length : 0;
    const avgLoss = losers.length ? -gl / losers.length : 0;

    // Planned R:R from SL/TP
    const planned = trades.filter((t) => t.sl && t.tp && Math.abs(t.entry - t.sl) > 0).map((t) => ({ t, rr: Math.abs(t.tp - t.entry) / Math.abs(t.entry - t.sl) }));
    const median = (arr) => { const s = arr.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
    const rrMed = median(planned.map((p) => p.rr));
    let rrText = '—', rrSub = 'Add SL & TP to trades';
    if (rrMed) { rrText = `1 : ${rrMed.toFixed(1)}`; rrSub = 'Planned, median'; }
    else if (avgWin && avgLoss) { rrText = `1 : ${(avgWin / Math.abs(avgLoss)).toFixed(1)}`; rrSub = 'Realised avg win ÷ avg loss'; }

    // Sharpe from daily returns
    const rets = [];
    for (let i = 1; i < values.length; i++) rets.push((values[i] - values[i - 1]) / values[i - 1]);
    const mean = rets.length ? sum(rets) / rets.length : 0;
    const sd = rets.length > 1 ? Math.sqrt(sum(rets, (r) => (r - mean) ** 2) / (rets.length - 1)) : 0;
    const sharpe = rets.length >= 20 && n >= 5 && sd > 0 ? (mean / sd) * Math.sqrt(252) : null;

    // Drawdown (daily)
    let pk = -Infinity;
    const ddValues = values.map((v) => { pk = Math.max(pk, v); return ((v - pk) / pk) * 100; });

    // ---- Monthly P&L (last 12 months)
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ y: d.getFullYear(), m: d.getMonth(), v: 0 });
    }
    trades.forEach((t) => { const mo = months.find((x) => x.y === t.date.getFullYear() && x.m === t.date.getMonth()); if (mo) mo.v += t.pnl; });

    // ---- Distribution
    const buckets = [[-Infinity, -2000], [-2000, -1000], [-1000, 0], [0, 1000], [1000, 2000], [2000, Infinity]];
    const dist = buckets.map(([a, b], i) => trades.filter((t) => (i === 2 ? t.pnl >= a && t.pnl < 0 : i === 3 ? t.pnl >= 0 && t.pnl < b : t.pnl >= a && t.pnl < b)).length);

    // ---- Group helpers
    function groupBy(keyFn) {
      const map = new Map();
      trades.forEach((t) => { const k = keyFn(t); if (!map.has(k)) map.set(k, []); map.get(k).push(t); });
      return [...map.entries()].map(([k, list]) => ({
        name: k, trades: list.length, pnl: sum(list, (t) => t.pnl),
        winRate: Math.round((list.filter((t) => t.pnl > 0).length / list.length) * 100), list,
      }));
    }
    const strategyPerf = groupBy((t) => t.strategy).sort((a, b) => b.pnl - a.pnl);
    const assetPerf = groupBy((t) => assetLabel(t.asset)).sort((a, b) => b.pnl - a.pnl);

    // ---- Frequency & hourly win rate
    const frequency = D.weekdays.map(() => D.hours.map(() => 0));
    const hourAll = D.hours.map(() => 0), hourWin = D.hours.map(() => 0);
    trades.forEach((t) => {
      frequency[weekdayIdx(t.date)][hourIdx(t.date)]++;
      hourAll[hourIdx(t.date)]++;
      if (t.pnl > 0) hourWin[hourIdx(t.date)]++;
    });
    const hourlyVals = hourAll.map((c, i) => (c ? Math.round((hourWin[i] / c) * 100) : null));
    let bestHour = -1;
    hourlyVals.forEach((v, i) => { if (v !== null && hourAll[i] >= 2 && (bestHour < 0 || v > hourlyVals[bestHour])) bestHour = i; });

    // ---- Risk per trade (from stop losses)
    const withSl = trades.filter((t) => t.sl);
    const riskPct = (t) => (Math.abs(t.entry - t.sl) * t.qty * fx(t.asset) / capital) * 100;
    const riskGroups = new Map();
    withSl.forEach((t) => { const k = t.asset; if (!riskGroups.has(k)) riskGroups.set(k, []); riskGroups.get(k).push(riskPct(t)); });
    const riskItems = [...riskGroups.entries()].map(([a, arr], i) => ({ name: assetLabel(a), value: +(sum(arr) / arr.length).toFixed(2), color: assetColor(a, i) }))
      .sort((a, b) => b.value - a.value).slice(0, 5);
    const avgRisk = withSl.length ? sum(withSl, riskPct) / withSl.length : 0;

    // ---- Volume by asset
    const vol = groupBy((t) => t.asset).map((g, i) => ({ name: assetLabel(g.name), amount: Math.round(sum(g.list, (t) => t.entry * t.qty * fx(t.asset))), color: assetColor(g.name, i) }))
      .sort((a, b) => b.amount - a.amount);
    const volTotal = sum(vol, (v) => v.amount) || 1;
    vol.forEach((v) => { v.value = Math.round((v.amount / volTotal) * 100); });

    // ---- Emotions
    const emotions = groupBy((t) => t.emotion || 'Calm').map((g) => ({ name: g.name, emoji: EMOJI[g.name] || '•', winRate: g.winRate, count: g.trades, pnl: g.pnl }))
      .sort((a, b) => b.winRate - a.winRate);
    const impulsiveTrades = trades.filter((t) => IMPULSIVE.includes(t.emotion));
    const worstEmotion = emotions.filter((x) => IMPULSIVE.includes(x.name) && x.pnl < 0).sort((a, b) => a.pnl - b.pnl)[0];
    const emotionNote = worstEmotion
      ? { tone: 'bad', html: `Trades tagged <b style="color:var(--text)">${worstEmotion.name}</b> lose on ${100 - worstEmotion.winRate}% of occasions and have cost you <b class="neg">${window.UI.inr(worstEmotion.pnl, { sign: true })}</b>.` }
      : { tone: 'good', html: n ? 'No emotion tag is costing you money yet — keep tagging trades honestly.' : 'Tag each trade with how you felt to see how emotions affect results.' };

    // ---- Chain
    const verifiedList = trades.filter((t) => t.verified);
    const chain = {
      verified: verifiedList.length, total: n,
      rate: n ? +((verifiedList.length / n) * 100).toFixed(1) : 0,
      snapshots: ws.snapshots.length, integrity: verifiedList.length ? '100%' : '—', extra: 0,
    };

    const ai = buildAI({ ws, trades, n, winRate, pfNum, maxDD, avgRisk, withSl, impulsiveTrades, strategyPerf, hourAll, hourWin, planned, capital, total, now });

    const firstTradeDays = n ? Math.max(1, Math.round((now - trades[0].date) / DAY)) : 0;
    return {
      mode: 'user', empty: n === 0, tradeCount: n,
      portfolio: { value, change: total, changePct: (total / capital) * 100, todayPnl, todayPct: sod ? (todayPnl / sod) * 100 : 0, start: capital },
      equitySeries,
      ranges: ['1D', '1W', '1M', '3M', '6M', 'All'], defaultRange: 'All',
      sparks: {
        value: values.length > 1 ? values.slice(-30) : [capital, capital],
        today: intraday.values,
        win: winSpark.length > 1 ? winSpark.slice(-20) : null,
        dd: ddSpark.length > 1 ? ddSpark.slice(-20) : null,
      },
      winRate,
      winFoot: n ? `<span>${winners.length}W · ${losers.length}L</span><span>all time</span>` : '<span>Log trades to measure</span>',
      maxDD,
      ddFoot: n ? `<span>peak-to-trough</span><span>over ${n} trade${n === 1 ? '' : 's'}</span>` : '<span>No drawdown yet</span>',
      metrics: {
        totalTrades: n, winning: winners.length, losing: losers.length, winRate: +winRate.toFixed(1),
        avgWin: Math.round(avgWin), avgLoss: Math.round(avgLoss), maxDrawdown: +maxDD.toFixed(1), netPnl: Math.round(total),
        pfText: n ? (gl ? (gp / gl).toFixed(2) : gp > 0 ? '∞' : '—') : '—',
        sharpeText: sharpe === null ? '—' : sharpe.toFixed(2), rrText, rrSub,
        totalSub: n ? `Over ${firstTradeDays} day${firstTradeDays === 1 ? '' : 's'}` : 'No trades yet',
        ddSub: 'Peak-to-trough, trade by trade', winSub: n ? `${winners.length} of ${n} trades` : '—',
      },
      monthlyPnl: { labels: months.map((x) => window.UI.MONTHS[x.m]), values: months.map((x) => Math.round(x.v)), years: months.map((x) => x.y) },
      pnlDistribution: { labels: D.pnlDistribution.labels, values: dist },
      strategyPerf, assetPerf,
      weekdays: D.weekdays, hours: D.hours, frequency,
      hourlyWinRate: { labels: HOUR_LABELS, values: hourlyVals },
      hourlyBadge: bestHour >= 0 ? `Peak ${HOUR_LABELS[bestHour]} · ${hourlyVals[bestHour]}%` : 'Needs more trades',
      risk: riskItems.length ? {
        title: 'Risk per Trade', sub: 'Average capital at risk, from your stop losses', centerLabel: 'avg / trade',
        items: riskItems, total: +avgRisk.toFixed(2), badge: `${avgRisk.toFixed(2)}% avg / ${u.maxRisk}% limit`,
        scale: Math.max(u.maxRisk, ...riskItems.map((r) => r.value)) || 1, over: avgRisk > u.maxRisk,
      } : null,
      allocation: vol.length ? { title: 'Volume by Asset', sub: 'Notional traded per instrument', centerLabel: 'Traded', centerValue: window.UI.inrCompact(volTotal), items: vol.slice(0, 6) } : null,
      drawdown: { labels: dates, values: ddValues },
      emotions, emotionNote,
      ai,
      chain,
      snapshots: ws.snapshots,
      recentBlocks: recentBlocks(),
      executions: ws.executions || [],
      blockNow: blockNow(),
    };
  }

  /* ---------- Rule-based "AI" engine (runs locally) ---------- */
  function buildAI(c) {
    const esc = window.UI.esc;
    const { ws, trades, n, winRate, pfNum, maxDD, avgRisk, withSl, impulsiveTrades, strategyPerf, hourAll, hourWin, planned, capital, now } = c;
    const inr = window.UI.inr;
    const NEED = 5;
    if (n < NEED) return { locked: true, need: NEED, have: n };

    const slShare = withSl.length / n;
    const impShare = impulsiveTrades.length / n;
    const days = new Map();
    trades.forEach((t) => days.set(dayKey(t.date), (days.get(dayKey(t.date)) || 0) + t.pnl));
    const greenDays = [...days.values()].filter((v) => v > 0).length / days.size;
    const maxRisk = ws.user.maxRisk;

    const subscores = [
      { name: 'Strategy Edge', value: clamp(Math.round(50 + (pfNum - 1) * 25 + (winRate - 50) * 0.6), 20, 98) },
      { name: 'Discipline', value: clamp(Math.round(35 + slShare * 55 + (1 - impShare) * 10), 20, 98) },
      { name: 'Consistency', value: clamp(Math.round(30 + greenDays * 65), 20, 98) },
      { name: 'Emotional Control', value: clamp(Math.round(95 - impShare * 80), 20, 98) },
      { name: 'Risk Management', value: clamp(Math.round(95 - maxDD * 3.5 - Math.max(0, avgRisk - maxRisk) * 10 - (1 - slShare) * 15), 20, 98) },
    ];
    // Small samples are unreliable: pull scores toward a neutral 60 until ~20 trades
    const conf = Math.min(1, n / 20);
    subscores.forEach((s) => { s.value = Math.round(60 + (s.value - 60) * (0.35 + 0.65 * conf)); });
    subscores.sort((a, b) => b.value - a.value);
    const score = Math.round(sum(subscores, (s) => s.value) / subscores.length);
    const label = score >= 85 ? 'Elite Trader' : score >= 75 ? 'Strong Trader' : score >= 60 ? 'Developing Trader' : score >= 45 ? 'Building Consistency' : 'Needs Structure';
    const best = subscores[0], worst = subscores[subscores.length - 1];

    // Card 1 — best strategy
    const eligible = strategyPerf.filter((s) => s.trades >= 2 && s.pnl > 0);
    const top = eligible[0] || strategyPerf.find((s) => s.pnl > 0);
    const card1 = top
      ? { emoji: '🎯', bg: 'var(--green-soft)', kicker: 'Best Strategy', title: `${esc(top.name)} Trading`, text: `Your ${esc(top.name.toLowerCase())} strategy is currently your most profitable, adding ${inr(top.pnl, { sign: true })} across ${top.trades} trade${top.trades === 1 ? '' : 's'}.`, foot: `Win Rate: <b class="pos">${top.winRate}%</b>`, conf: clamp(55 + top.trades * 4, 55, 96) }
      : { emoji: '🧭', bg: 'var(--blue-soft)', kicker: 'Best Strategy', title: 'No edge yet', text: 'None of your strategies is net profitable yet. Keep tagging setups consistently so the edge becomes visible.', foot: `${strategyPerf.length} strategies tracked`, conf: 60 };

    // Card 2 — risk warning (first issue that applies)
    const notional = trades.map((t) => t.entry * t.qty * fx(t.asset));
    const avgNotional = sum(notional) / n;
    const afterWins = [];
    for (let i = 2; i < n; i++) if (trades[i - 1].pnl > 0 && trades[i - 2].pnl > 0) afterWins.push(notional[i]);
    const creep = afterWins.length >= 2 ? (sum(afterWins) / afterWins.length) / avgNotional - 1 : 0;
    const impLosses = impulsiveTrades.filter((t) => t.pnl < 0);
    let card2;
    if (creep > 0.15) card2 = { emoji: '⚠️', bg: 'var(--amber-soft)', kicker: 'Risk Warning', title: 'Position Sizing', text: 'Your average position size increases after consecutive wins. This may increase portfolio risk.', foot: `Size +${Math.round(creep * 100)}% after 2 wins`, conf: 80, accent: 'amber' };
    else if (slShare < 0.6) card2 = { emoji: '⚠️', bg: 'var(--amber-soft)', kicker: 'Risk Warning', title: 'Stop-Loss Discipline', text: `${Math.round((1 - slShare) * 100)}% of your trades have no stop loss recorded. Undefined risk makes drawdowns harder to control.`, foot: `${withSl.length} of ${n} trades with SL`, conf: 90, accent: 'amber' };
    else if (impulsiveTrades.length >= 2 && impLosses.length / impulsiveTrades.length >= 0.5) card2 = { emoji: '⚠️', bg: 'var(--amber-soft)', kicker: 'Risk Warning', title: 'Emotional Trading', text: `Trades tagged FOMO, Greedy or Anxious lose ${Math.round((impLosses.length / impulsiveTrades.length) * 100)}% of the time.`, foot: `Cost ${inr(sum(impLosses, (t) => t.pnl), { sign: true })}`, conf: 84, accent: 'amber' };
    else if (avgRisk > maxRisk) card2 = { emoji: '⚠️', bg: 'var(--amber-soft)', kicker: 'Risk Warning', title: 'Risk per Trade', text: `You risk ${avgRisk.toFixed(2)}% per trade on average, above your ${maxRisk}% limit.`, foot: 'From your stop losses', conf: 85, accent: 'amber' };
    else if (maxDD > 10) card2 = { emoji: '⚠️', bg: 'var(--amber-soft)', kicker: 'Risk Warning', title: 'Drawdown', text: `Your equity fell ${maxDD.toFixed(1)}% from its peak. Consider reducing size until you recover.`, foot: 'Peak-to-trough', conf: 88, accent: 'amber' };
    else card2 = { emoji: '✅', bg: 'var(--green-soft)', kicker: 'Risk Check', title: 'No major risk', text: 'Stops are in place, sizing is steady and drawdown is contained. Keep it that way.', foot: `Max drawdown ${maxDD.toFixed(1)}%`, conf: 78 };

    // Card 3 — best 3-hour window
    const minW = n >= 10 ? 3 : 2;
    let win = null;
    for (let h = 0; h <= hourAll.length - 3; h++) {
      const cnt = hourAll[h] + hourAll[h + 1] + hourAll[h + 2];
      const w = hourWin[h] + hourWin[h + 1] + hourWin[h + 2];
      if (cnt >= minW && (!win || w / cnt > win.rate || (w / cnt === win.rate && cnt > win.cnt))) win = { h: h + 9, rate: w / cnt, cnt };
    }
    const card3 = win
      ? { emoji: '🕐', bg: 'var(--blue-soft)', kicker: 'Best Trading Time', title: `${fmtHour(win.h)} – ${fmtHour(win.h + 3)}`, text: `You win ${Math.round(win.rate * 100)}% of trades placed in this window, vs ${Math.round(winRate)}% overall.`, foot: `Win Rate: <b class="pos">${Math.round(win.rate * 100)}%</b>`, conf: clamp(50 + win.cnt * 6, 55, 94) }
      : { emoji: '🕐', bg: 'var(--blue-soft)', kicker: 'Best Trading Time', title: 'Not enough data', text: 'Spread a few more trades across the day to find your best session.', foot: '—', conf: 50 };

    // Card 4 — pattern
    let card4;
    const hi = planned.filter((p) => p.rr >= 2), lo = planned.filter((p) => p.rr < 2);
    const wr = (arr) => Math.round((arr.filter((p) => (p.t || p).pnl > 0).length / arr.length) * 100);
    if (hi.length && lo.length) {
      const better = wr(hi) >= wr(lo);
      card4 = { emoji: '📈', bg: 'var(--purple-soft)', kicker: 'Trading Pattern', title: better ? 'R:R above 1:2' : 'Tighter targets', text: better ? 'You perform better when your risk/reward ratio is above 1:2.' : 'Your trades with targets below 2R hit more often — your wide targets may be unrealistic.', foot: `Win rate ${wr(hi)}% (≥2R) vs ${wr(lo)}% (<2R)`, conf: clamp(50 + planned.length * 4, 55, 92) };
    } else {
      const longs = trades.filter((t) => t.type === 'BUY'), shorts = trades.filter((t) => t.type === 'SELL');
      if (longs.length && shorts.length) {
        const lw = wr(longs), sw = wr(shorts);
        card4 = { emoji: '📈', bg: 'var(--purple-soft)', kicker: 'Trading Pattern', title: lw >= sw ? 'Stronger on longs' : 'Stronger on shorts', text: `You perform better on ${lw >= sw ? 'long' : 'short'} trades. Consider being more selective on the other side.`, foot: `Long ${lw}% vs short ${sw}%`, conf: 70 };
      } else {
        card4 = { emoji: '📈', bg: 'var(--purple-soft)', kicker: 'Trading Pattern', title: 'One-sided so far', text: `All your trades so far are ${trades[0].type === 'BUY' ? 'long' : 'short'}. Add SL and TP to unlock risk/reward analysis.`, foot: `${n} trades`, conf: 60 };
      }
    }

    // Weekly summary
    const weekAgo = new Date(now.getTime() - 7 * DAY);
    let period = trades.filter((t) => t.date >= weekAgo);
    let periodLabel = 'This week';
    if (!period.length) { period = trades; periodLabel = 'So far'; }
    const pN = period.length, pW = period.filter((t) => t.pnl > 0).length, pP = sum(period, (t) => t.pnl);
    const pStrat = new Map(); period.forEach((t) => pStrat.set(t.strategy, (pStrat.get(t.strategy) || 0) + t.pnl));
    const [bestS, bestSV] = [...pStrat.entries()].sort((a, b) => b[1] - a[1])[0];
    const worstT = period.slice().sort((a, b) => a.pnl - b.pnl)[0];
    const bestT = period.slice().sort((a, b) => b.pnl - a.pnl)[0];
    const pImp = period.filter((t) => IMPULSIVE.includes(t.emotion)).length;

    const actions = [];
    if (slShare < 0.9) actions.push('Set a stop loss on every trade before entry');
    if (avgRisk > maxRisk) actions.push(`Cap risk at ${maxRisk}% per trade for the next 10 trades`);
    if (creep > 0.15) actions.push('Keep position size fixed after winning streaks');
    if (impulsiveTrades.length) actions.push('Review your FOMO / Greedy / Anxious trades before the next session');
    if (win) actions.push(`Concentrate execution between ${fmtHour(win.h)} and ${fmtHour(win.h + 3)}`);
    const unverified = trades.filter((t) => !t.verified).length;
    if (unverified) actions.push(`Verify ${unverified} unverified trade${unverified === 1 ? '' : 's'} on-chain`);
    if (actions.length < 3) actions.push('Keep logging — insights sharpen after 20+ trades');

    const summary = [
      `${periodLabel} you closed <b>${pN} trade${pN === 1 ? '' : 's'}</b> with a <b>${((pW / pN) * 100).toFixed(1)}% win rate</b>, finishing <b class="${pP >= 0 ? 'pos' : 'neg'}">${inr(Math.round(pP), { sign: true })}</b> (${(pP / capital * 100 >= 0 ? '+' : '') + (pP / capital * 100).toFixed(2)}% of starting capital). `,
      bestSV > 0 ? `Your <b>${esc(bestS)}</b> setups contributed the most, adding ${inr(Math.round(bestSV), { sign: true })}. ` : `None of your setups was net positive in this period — <b>${esc(bestS)}</b> came closest. `,
      worstT.pnl < 0 ? `The biggest drag was <b>${worstT.id}</b> on ${worstT.asset} (${inr(worstT.pnl, { sign: true })})${IMPULSIVE.includes(worstT.emotion) ? `, tagged "${worstT.emotion}"` : ''}. ` : 'You had no losing trades in this period. ',
      pImp ? `<b class="warn">${pImp}</b> of these trades were tagged FOMO, Greedy or Anxious. ` : 'None of these trades were tagged as impulsive — good emotional control. ',
      `Overall score: <b>${score}/100</b>. Focus next: ${actions[0].charAt(0).toLowerCase() + actions[0].slice(1)}.`,
    ];

    return {
      locked: false, score, label,
      blurb: `Your strongest area is ${best.name.toLowerCase()} (${best.value}); ${worst.name.toLowerCase()} (${worst.value}) is what's holding the score back.`,
      chips: [`<span class="badge badge-neutral">Based on ${n} trades</span>`, n < 20 ? '<span class="badge badge-amber">Provisional · sharpens at 20 trades</span>' : '<span class="badge badge-purple">Computed locally</span>'],
      subscores,
      cards: [card1, card2, card3, card4],
      snapshot: `${card1.emoji} ${card1.title === 'No edge yet' ? 'No profitable strategy yet.' : `<b style="color:var(--text)">${esc(top.name)}</b> is your best strategy at <b class="pos">${top.winRate}%</b> win rate.`} ${card2.emoji} ${card2.title}.`,
      snapshotSub: `${best.name} is your strongest area.`,
      summaryTitle: periodLabel === 'This week' ? 'Last 7 days' : 'All trades so far',
      summary,
      summaryStats: [['Trades', String(pN), ''], ['Win rate', ((pW / pN) * 100).toFixed(1) + '%', ''], ['Net P&L', inr(Math.round(pP), { sign: true }), pP >= 0 ? 'pos' : 'neg'], ['Best trade', bestT.id, '']],
      actions: actions.slice(0, 4),
    };
  }

  window.MODEL = () => {
    const ws = window.TC_STATE;
    return ws.mode === 'user' ? userModel(ws) : demoModel(ws);
  };
  window.MODEL_UTIL = { blockNow, fx };
})();
