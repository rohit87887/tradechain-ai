/* ==========================================================================
   TradeChain AI — mock data (deterministic, frontend-only)
   Nothing here touches a real exchange, wallet or blockchain.
   ========================================================================== */
(function () {
  'use strict';

  // Seeded PRNG so the demo looks identical on every load
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20261006);
  const between = (a, b) => a + rand() * (b - a);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const hex = (n) => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(rand() * 16)]).join('');
  const gauss = () => {
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const NOW = new Date(2026, 9, 6, 22, 52); // Demo "today": 06 Oct 2026
  const DAY = 86400000;
  const USD_INR = 83.6;

  // Brownian bridge between two values over n steps (n+1 points)
  function bridge(start, end, n, vol) {
    const w = [0];
    for (let i = 1; i <= n; i++) w.push(w[i - 1] + gauss());
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      out.push(start + (end - start) * t + (w[i] - w[n] * t) * vol);
    }
    return out;
  }

  /* ---------- Equity curve ---------- */
  const anchors = [
    [0, 219600], [40, 224800], [70, 221900], [120, 229800], [150, 236200],
    [185, 218200], [230, 226400], [270, 233900], [300, 231200], [335, 240800],
    [364, 241760], [365, 245000],
  ];
  const daily = [];
  for (let a = 0; a < anchors.length - 1; a++) {
    const [d0, v0] = anchors[a];
    const [d1, v1] = anchors[a + 1];
    const seg = bridge(v0, v1, d1 - d0, 380);
    if (a > 0) seg.shift();
    daily.push(...seg);
  }
  const dailyDates = daily.map((_, i) => new Date(NOW.getTime() - (365 - i) * DAY));

  // Intraday (today) — 10 minute bars
  const intradaySteps = 137;
  const intraday = bridge(241760, 245000, intradaySteps, 140);
  const intradayDates = intraday.map((_, i) => {
    const d = new Date(NOW); d.setHours(0, 0, 0, 0);
    return new Date(d.getTime() + i * 10 * 60000);
  });

  // Last week — hourly
  const weekly = [];
  for (let d = 358; d < 365; d++) {
    const seg = bridge(daily[d], daily[d + 1], 24, 260);
    if (d > 358) seg.shift();
    weekly.push(...seg);
  }
  const weeklyDates = weekly.map((_, i) => new Date(NOW.getTime() - (weekly.length - 1 - i) * 3600000));

  function equitySeries(range) {
    if (range === '1D') return { values: intraday, dates: intradayDates, fmt: 'time' };
    if (range === '1W') return { values: weekly, dates: weeklyDates, fmt: 'dayhour' };
    const len = { '1M': 31, '3M': 92, '6M': 183, '1Y': 366 }[range];
    return { values: daily.slice(-len), dates: dailyDates.slice(-len), fmt: 'date' };
  }

  function drawdownSeries() {
    let peak = -Infinity;
    return daily.map((v) => { peak = Math.max(peak, v); return ((v - peak) / peak) * 100; });
  }

  /* ---------- Assets ---------- */
  const ASSETS = {
    'BTC/USDT': { cur: '$', range: [86000, 99000], dec: 0, color: '#f7931a', short: 'BTC' },
    'ETH/USDT': { cur: '$', range: [3150, 3950], dec: 0, color: '#627eea', short: 'ETH' },
    'SOL/USDT': { cur: '$', range: [158, 212], dec: 2, color: '#14b8a6', short: 'SOL' },
    'BNB/USDT': { cur: '$', range: [560, 640], dec: 2, color: '#e8b30b', short: 'BNB' },
    'NIFTY 50': { cur: '₹', range: [24800, 26200], dec: 2, color: '#5b8cff', short: 'NIF' },
    'RELIANCE': { cur: '₹', range: [2850, 3150], dec: 2, color: '#9b7bff', short: 'REL' },
  };
  const STRATEGIES = ['Breakout', 'Support', 'Momentum', 'Reversal', 'Scalping'];
  const EMOTIONS = ['Calm', 'Confident', 'Disciplined', 'Anxious', 'FOMO', 'Greedy'];
  const NOTES = [
    'Clean retest of the range high, volume confirmed.',
    'Entered early, should have waited for the candle close.',
    'Followed plan, trailed stop to breakeven after 1R.',
    'News-driven spike, reduced size.',
    'Bounce off daily support with bullish divergence.',
    'Took profit at TP1, let the runner go.',
    'Chased the move — FOMO entry.',
  ];

  function qtyFor(asset, entry, exit, pnlInr) {
    const a = ASSETS[asset];
    const fx = a.cur === '$' ? USD_INR : 1;
    const diff = Math.abs(exit - entry) * fx;
    if (!diff) return 1;
    const q = Math.abs(pnlInr) / diff;
    return q < 1 ? +q.toFixed(4) : +q.toFixed(2);
  }

  function fullHash(prefix, suffix) {
    return '0x' + (prefix + hex(64 - prefix.length - suffix.length) + suffix).toUpperCase();
  }

  const BLOCK_TODAY = 18492821;
  const blockForDate = (d) => BLOCK_TODAY - Math.round((NOW - d) / DAY * 7140) - Math.floor(rand() * 40);

  function at(m, d, h, min) { return new Date(2026, m, d, h, min); }

  const seed = [
    { id: 'TRD-1024', asset: 'BTC/USDT', type: 'BUY', entry: 95200, exit: 97500, pnl: 1250, strategy: 'Breakout', verified: true, date: at(9, 6, 22, 42), hash: fullHash('8A72F91C', '91FC'), block: 18492821, emotion: 'Disciplined', notes: 'Breakout above 95k with strong volume. Trailed stop under the retest.', sl: 94300, tp: 97800 },
    { id: 'TRD-1023', asset: 'ETH/USDT', type: 'SELL', entry: 3420, exit: 3380, pnl: 980, strategy: 'Reversal', verified: true, date: at(9, 5, 15, 18), hash: fullHash('91AF3C07', '72BC'), block: 18485544, emotion: 'Calm', notes: 'Rejection from weekly resistance with bearish engulfing.', sl: 3465, tp: 3360 },
    { id: 'TRD-1025', asset: 'SOL/USDT', type: 'BUY', entry: 185, exit: 179, pnl: -650, strategy: 'Momentum', verified: false, date: at(9, 5, 20, 6), hash: null, block: null, emotion: 'FOMO', notes: 'Chased the move after a 6% candle. Stopped out.', sl: 179, tp: 198 },
    { id: 'TRD-1022', asset: 'BTC/USDT', type: 'BUY', entry: 91500, exit: 94100, pnl: 2100, strategy: 'Support', verified: true, date: at(9, 4, 11, 24), hash: fullHash('72CD1E85', '91AA'), block: 18478102, emotion: 'Confident', notes: 'Bounce from 91k demand zone, held into resistance.', sl: 90400, tp: 94500 },
  ];
  seed.forEach((t) => { t.qty = qtyFor(t.asset, t.entry, t.exit, t.pnl); });

  // Older trades
  const generated = [];
  let cursor = new Date(2026, 9, 3, 18, 0);
  const unverifiedIdx = new Set([7]);
  for (let i = 0; i < 40; i++) {
    const asset = pick(Object.keys(ASSETS));
    const a = ASSETS[asset];
    const type = rand() < 0.62 ? 'BUY' : 'SELL';
    const win = rand() < 0.684;
    const strategy = pick(STRATEGIES);
    const pnl = Math.round(win ? between(240, 2400) : -between(220, 1700)) ;
    const entry = +between(a.range[0], a.range[1]).toFixed(a.dec);
    const pct = between(0.004, 0.028);
    const upMove = (type === 'BUY') === win;
    const exit = +(entry * (upMove ? 1 + pct : 1 - pct)).toFixed(a.dec);
    const date = new Date(cursor);
    date.setHours(Math.floor(between(9, 21)), Math.floor(between(0, 59)));
    const verified = !unverifiedIdx.has(i);
    const riskDist = entry * between(0.008, 0.015);
    const t = {
      id: 'TRD-' + String(1021 - i).padStart(4, '0'),
      asset, type, entry, exit, pnl, strategy, verified, date,
      hash: verified ? fullHash(hex(8).toUpperCase(), hex(4).toUpperCase()) : null,
      block: null,
      emotion: win ? pick(['Calm', 'Confident', 'Disciplined', 'Disciplined']) : pick(EMOTIONS),
      notes: pick(NOTES),
      sl: +(type === 'BUY' ? entry - riskDist : entry + riskDist).toFixed(a.dec),
      tp: +(type === 'BUY' ? entry + riskDist * 2 : entry - riskDist * 2).toFixed(a.dec),
    };
    t.qty = qtyFor(asset, entry, exit, pnl);
    if (verified) t.block = blockForDate(date);
    generated.push(t);
    cursor = new Date(cursor.getTime() - (rand() < 0.55 ? DAY : DAY * 0.5));
  }
  const trades = [...seed, ...generated];

  // Extra instruments available to new users (added after demo generation so sample data stays stable)
  Object.assign(ASSETS, {
    'XRP/USDT': { cur: '$', range: [0.5, 0.7], dec: 4, color: '#23292f', short: 'XRP' },
    'BANK NIFTY': { cur: '₹', range: [51000, 54000], dec: 2, color: '#38c6e8', short: 'BNF' },
    'TCS': { cur: '₹', range: [3900, 4300], dec: 2, color: '#e879f9', short: 'TCS' },
    'HDFCBANK': { cur: '₹', range: [1600, 1750], dec: 2, color: '#1fc77e', short: 'HDB' },
    'INFY': { cur: '₹', range: [1750, 1950], dec: 2, color: '#f0516a', short: 'INF' },
  });

  /* ---------- Analytics ---------- */
  const metrics = {
    totalTrades: 250, winning: 171, losing: 79, winRate: 68.4,
    profitFactor: 1.56, avgWin: 412, avgLoss: -570, riskReward: '1 : 1.8',
    sharpe: 1.82, maxDrawdown: 7.8, netPnl: 25400, expectancy: 102,
  };
  const monthlyPnl = {
    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    values: [2100, -1450, 3200, 1850, -2300, 4100, 2650, -900, 3800, 5200, 4410, 2740],
  };
  const pnlDistribution = {
    labels: ['< -2k', '-2k to -1k', '-1k to 0', '0 to 1k', '1k to 2k', '> 2k'],
    values: [4, 18, 57, 98, 56, 17],
  };
  const strategyPerf = [
    { name: 'Breakout', winRate: 74, pnl: 11840, trades: 72 },
    { name: 'Support', winRate: 69, pnl: 6920, trades: 58 },
    { name: 'Reversal', winRate: 66, pnl: 4050, trades: 41 },
    { name: 'Momentum', winRate: 61, pnl: 3180, trades: 49 },
    { name: 'Scalping', winRate: 52, pnl: -590, trades: 30 },
  ];
  const assetPerf = [
    { name: 'BTC', pnl: 10850, trades: 84 },
    { name: 'ETH', pnl: 6420, trades: 57 },
    { name: 'NIFTY', pnl: 4880, trades: 39 },
    { name: 'BNB', pnl: 2310, trades: 22 },
    { name: 'RELIANCE', pnl: 2180, trades: 18 },
    { name: 'SOL', pnl: -1240, trades: 30 },
  ];
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 13 }, (_, i) => 9 + i);
  const frequency = weekdays.map((d, di) => hours.map((h) => {
    const peak = Math.exp(-Math.pow((h - 11.5) / 2.4, 2)) * 5 + Math.exp(-Math.pow((h - 19) / 1.5, 2)) * 2.2;
    const wk = di >= 5 ? 0.45 : di === 0 ? 1.25 : 1;
    return Math.max(0, Math.round(peak * wk + rand() * 1.6 - 0.3));
  }));
  const hourlyWinRate = {
    labels: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'],
    values: [58, 71, 75, 73, 68, 61, 59, 55, 60, 63, 57, 52, 48],
  };
  const riskExposure = [
    { name: 'BTC', value: 2.4, color: '#f7931a' },
    { name: 'ETH', value: 1.6, color: '#627eea' },
    { name: 'SOL', value: 0.9, color: '#14b8a6' },
    { name: 'NIFTY', value: 0.8, color: '#5b8cff' },
    { name: 'BNB', value: 0.5, color: '#e8b30b' },
  ];
  const allocation = [
    { name: 'BTC', value: 38, color: '#f7931a' },
    { name: 'ETH', value: 22, color: '#627eea' },
    { name: 'NIFTY 50', value: 18, color: '#5b8cff' },
    { name: 'SOL', value: 9, color: '#14b8a6' },
    { name: 'Cash', value: 13, color: '#4b5263' },
  ];

  /* ---------- AI insights ---------- */
  const ai = {
    score: 84,
    label: 'Strong Trader',
    subscores: [
      { name: 'Strategy Edge', value: 91 },
      { name: 'Discipline', value: 88 },
      { name: 'Consistency', value: 82 },
      { name: 'Emotional Control', value: 79 },
      { name: 'Risk Management', value: 76 },
    ],
    summary: [
      'This week you closed <b>14 trades</b> with a <b>71.4% win rate</b>, finishing <b class="pos">+₹6,180</b> (+2.6%) — your second-best week this quarter. ',
      'Your <b>Breakout</b> setups on BTC carried the week, contributing 64% of net profit, and every one of them respected the planned stop. ',
      'The main leak was <b>SOL momentum entries taken after large candles</b>: both losses were tagged "FOMO" and entered more than 4% above the trigger. ',
      'Average position size rose <b>23%</b> after your three-win streak on Thursday, pushing open risk to <b class="warn">6.2%</b> of the portfolio — close to your 8% ceiling. ',
      'Next week, keep size fixed at 1% risk per trade, skip momentum entries extended beyond 2% from the trigger, and prioritise the 10 AM – 1 PM window where your win rate is 72%.',
    ],
    actions: [
      'Cap risk at 1% per trade for the next 10 trades',
      'Skip momentum entries extended > 2% from trigger',
      'Concentrate execution between 10:00 AM and 1:00 PM',
      'Review unverified trades and anchor them on-chain',
    ],
  };

  /* ---------- Blockchain ---------- */
  const chainStats = { verified: 247, rate: 98.8, snapshots: 12, integrity: 100 };
  const snapshots = [
    { id: 'SNP-012', date: new Date(2026, 9, 6), value: 245000, ret: 11.56, trades: 247, block: 18492790 },
    { id: 'SNP-011', date: new Date(2026, 8, 30), value: 240800, ret: 9.65, trades: 236, block: 18449874 },
    { id: 'SNP-010', date: new Date(2026, 7, 31), value: 231200, ret: 5.28, trades: 214, block: 18242305 },
    { id: 'SNP-009', date: new Date(2026, 6, 31), value: 233900, ret: 6.51, trades: 191, block: 18021116 },
  ];
  snapshots.forEach((s) => { s.root = fullHash(hex(8).toUpperCase(), hex(4).toUpperCase()); });

  const recentBlocks = Array.from({ length: 7 }, (_, i) => ({
    number: BLOCK_TODAY - (6 - i) * 3 - Math.floor(rand() * 2),
    hash: '0x' + hex(4) + '…' + hex(4),
    txs: Math.floor(between(38, 190)),
    age: (6 - i) * 36 + 12,
  }));

  /* ---------- Automation ---------- */
  const automations = [
    {
      id: 'SC-8A72F91', name: 'BTC Momentum Strategy', asset: 'BTC',
      conditions: [{ ind: 'BTC price', op: '<', val: '$90,000' }, { ind: 'RSI(14)', op: '<', val: '30' }],
      action: 'BUY', max: 5000, risk: 2, status: 'active', executions: 6, lastRun: '2 days ago', created: '12 Aug 2026',
    },
    {
      id: 'SC-3E19C04', name: 'ETH Take-Profit Guard', asset: 'ETH',
      conditions: [{ ind: 'ETH price', op: '>', val: '$3,800' }],
      action: 'SELL 50%', max: 8000, risk: 1.5, status: 'active', executions: 3, lastRun: '6 days ago', created: '28 Aug 2026',
    },
    {
      id: 'SC-71BD2A9', name: 'SOL Trend Follower', asset: 'SOL',
      conditions: [{ ind: 'EMA(20)', op: 'crosses above', val: 'EMA(50)' }, { ind: 'Volume', op: '>', val: '1.5× avg' }],
      action: 'BUY', max: 3000, risk: 1, status: 'paused', executions: 4, lastRun: '3 weeks ago', created: '02 Jul 2026',
    },
    {
      id: 'SC-C40F7E2', name: 'NIFTY Volatility Hedge', asset: 'NIFTY',
      conditions: [{ ind: 'India VIX', op: '>', val: '18' }],
      action: 'SELL', max: 10000, risk: 2.5, status: 'active', executions: 1, lastRun: '19 Sep 2026', created: '15 Sep 2026',
    },
  ];
  const executions = [
    { time: '04 Oct, 11:20', contract: 'SC-8A72F91', name: 'BTC Momentum Strategy', action: 'BUY', amount: 5000, price: '$89,640', result: 'Filled (sim)' },
    { time: '30 Sep, 16:02', contract: 'SC-3E19C04', name: 'ETH Take-Profit Guard', action: 'SELL 50%', amount: 7420, price: '$3,812', result: 'Filled (sim)' },
    { time: '19 Sep, 10:47', contract: 'SC-C40F7E2', name: 'NIFTY Volatility Hedge', action: 'SELL', amount: 9800, price: '₹25,112', result: 'Filled (sim)' },
    { time: '14 Sep, 13:31', contract: 'SC-8A72F91', name: 'BTC Momentum Strategy', action: 'BUY', amount: 4850, price: '$88,920', result: 'Filled (sim)' },
    { time: '12 Sep, 09:58', contract: 'SC-71BD2A9', name: 'SOL Trend Follower', action: 'BUY', amount: 3000, price: '$171.40', result: 'Skipped — risk limit' },
  ];

  /* ---------- Notifications ---------- */
  const notifications = [
    { kind: 'chain', html: 'Trade <b>TRD-1024</b> verified on blockchain', time: '10 min ago', unread: true },
    { kind: 'ai', html: 'AI detected improved performance in your <b>breakout strategy</b>', time: '1 hour ago', unread: true },
    { kind: 'warn', html: 'Risk exposure increased to <b>6.2%</b>', time: '3 hours ago', unread: true },
    { kind: 'chain', html: 'Portfolio snapshot <b>SNP-012</b> successfully verified', time: 'Today, 6:00 PM', unread: false },
    { kind: 'auto', html: '<b>BTC Momentum Strategy</b> executed a simulated BUY of ₹5,000', time: '2 days ago', unread: false },
    { kind: 'ai', html: 'Your weekly AI performance report is ready', time: '3 days ago', unread: false },
  ];

  window.TC_DATA = {
    NOW, USD_INR, ASSETS, STRATEGIES, EMOTIONS,
    portfolio: { value: 245000, change: 25400, changePct: 11.56, todayPnl: 3240, todayPct: 1.34, start: 219600 },
    equitySeries, drawdownSeries, daily, dailyDates,
    trades, metrics, monthlyPnl, pnlDistribution, strategyPerf, assetPerf,
    weekdays, hours, frequency, hourlyWinRate, riskExposure, allocation,
    ai, chainStats, snapshots, recentBlocks, automations, executions, notifications,
    BLOCK_TODAY,
    rand, hex,
  };
})();
