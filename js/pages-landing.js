/* ==========================================================================
   TradeChain AI — Landing page
   ========================================================================== */
(function () {
  'use strict';
  const D = window.TC_DATA;
  const { icon, inr, pct, price, fmtDate, fmtTime, shortHash, esc, assetIcon, sparkline } = window.UI;
  const PAGES = (window.PAGES = window.PAGES || {});
  const hasUser = () => !!(window.APP && window.APP.hasUser());

  /* ======================================================================
     Landing
     ====================================================================== */
  function previewCurve() {
    const vals = D.daily.filter((_, i) => i % 3 === 0);
    const w = 800, h = 220;
    const min = Math.min(...vals), max = Math.max(...vals);
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 10 - ((v - min) / (max - min)) * (h - 30)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs><linearGradient id="pvg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1fc77e" stop-opacity=".25"/><stop offset="1" stop-color="#1fc77e" stop-opacity="0"/></linearGradient></defs>
      ${[0.25, 0.5, 0.75].map((f) => `<line x1="0" x2="${w}" y1="${h * f}" y2="${h * f}" stroke="rgba(255,255,255,0.05)"/>`).join('')}
      <path d="${d} L${w} ${h} L0 ${h} Z" fill="url(#pvg)" opacity=".9"/>
      <path class="pv-path" d="${d}" fill="none" stroke="#1fc77e" stroke-width="2" vector-effect="non-scaling-stroke"/>
    </svg>`;
  }

  PAGES.landing = {
    shell: false,
    render() {
      const navItems = [['dashboard', 'Dashboard'], ['journal', 'Journal'], ['analytics', 'Analytics'], ['ai', 'AI Insights'], ['chain', 'Blockchain'], ['bolt', 'Automation']];
      return `
      <div class="landing">
        <nav class="l-nav" id="lnav">
          <a class="brand" href="#/" style="padding:0">
            <span class="brand-mark">${icon('chain')}</span>
            <span class="brand-name">TradeChain <span>AI</span></span>
          </a>
          <div class="links">
            <a href="#features" data-scroll>Features</a>
            <a href="#how" data-scroll>How it works</a>
            <a href="#trust" data-scroll>Verification</a>
          </div>
          <div class="right">
            <a class="btn btn-ghost" href="#/dashboard?demo=1">View demo</a>
            <a class="btn btn-primary" href="#/start">${hasUser() ? 'Open my journal' : 'Get Started'} ${icon('arrowRight')}</a>
          </div>
        </nav>

        <div class="l-wrap">
          <section class="hero">
            <div class="hero-grid-bg"></div>
            <div class="hero-glow"></div>
            <span class="eyebrow"><span class="new">New</span> AI weekly reviews &amp; on-chain portfolio snapshots</span>
            <div class="brand-line">TradeChain AI</div>
            <h1><span class="grad">Analyze. Verify.</span><br>Trade Smarter.</h1>
            <p class="lead">An AI-powered trading journal and portfolio analyzer with blockchain-verified performance records and smart trading automation.</p>
            <div class="cta">
              <a class="btn btn-primary btn-lg" href="#/start">${hasUser() ? 'Open my journal' : 'Get Started — it’s free'} ${icon('arrowRight')}</a>
              <a class="btn btn-lg" href="#/dashboard?demo=1">${icon('play')} View Demo</a>
            </div>
            <div class="assure">
              <span>${icon('check')} No account needed — saved in your browser</span>
              <span>${icon('check')} Simulated testnet verification</span>
              <span>${icon('check')} No real funds or wallets</span>
            </div>

            <div class="preview-stage" style="position:relative">
              <div class="pv-float" style="left:-28px;top:150px">
                <span class="fi" style="background:var(--green-soft);color:var(--green)">${icon('shield')}</span>
                <div><b>TRD-1024 verified</b><div class="muted mono" style="font-size:11px">Block #18,492,821</div></div>
              </div>
              <div class="pv-float" style="right:-24px;top:300px;animation-delay:-3s">
                <span class="fi" style="background:var(--purple-soft);color:var(--purple)">${icon('ai')}</span>
                <div><b>AI Score 84 / 100</b><div class="muted" style="font-size:11px">Breakout edge improving</div></div>
              </div>
              <div class="preview">
                <div class="pv-bar"><i></i><i></i><i></i><span class="url">app.tradechain.ai/dashboard</span></div>
                <div class="pv-body">
                  <div class="pv-side">
                    ${navItems.map(([ic, l], i) => `<div class="${i === 0 ? 'on' : ''}">${icon(ic)} ${l}</div>`).join('')}
                  </div>
                  <div class="pv-main">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div><div style="font-weight:600;font-size:15px">Good evening, Trader 👋</div><div class="muted" style="font-size:11.5px">Here's your trading performance overview.</div></div>
                      <span class="demo-tag">Demo</span>
                    </div>
                    <div class="pv-stats">
                      <div class="pv-stat"><small>Portfolio Value</small><b>₹2,45,000</b><em class="pos">+11.56%</em></div>
                      <div class="pv-stat"><small>Today's P&amp;L</small><b class="pos">+₹3,240</b><em class="pos">+1.34%</em></div>
                      <div class="pv-stat"><small>Win Rate</small><b>68.4%</b><em class="pos">↑ 4.2%</em></div>
                      <div class="pv-stat"><small>Max Drawdown</small><b>7.8%</b><em class="pos">↓ 1.3%</em></div>
                    </div>
                    <div class="pv-chart">
                      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px"><b>Portfolio Performance</b><span class="muted">1Y</span></div>
                      ${previewCurve()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="l-section" id="features">
            <div class="reveal" style="text-align:center">
              <div class="l-kicker">Platform</div>
              <h2 class="l-h2">Everything a serious trader needs.<br><span class="muted">In one verifiable workspace.</span></h2>
            </div>
            <div class="feature-grid">
              ${[
                ['ai', 'purple', 'AI Trading Insights', 'Understand trading behavior and identify profitable patterns.', featureVisualAI()],
                ['analytics', 'green', 'Portfolio Analytics', 'Track returns, risk, drawdown and overall performance.', featureVisualBars()],
                ['shield', 'blue', 'Blockchain Verification', 'Verify that historical trading records have not been modified.', featureVisualHash()],
                ['bolt', 'amber', 'Smart Automation', 'Create rule-based trading strategies through a simulated smart-contract interface.', featureVisualRule()],
              ].map(([ic, c, t, p, vis], i) => `
                <div class="card feature reveal" style="transition-delay:${i * 80}ms">
                  <div class="f-ico" style="background:var(--${c}-soft);color:var(--${c})">${icon(ic)}</div>
                  <h3>${t}</h3><p>${p}</p>
                  <div class="f-visual">${vis}</div>
                </div>`).join('')}
            </div>
          </section>

          <section class="l-section" id="how">
            <div class="reveal">
              <div class="l-kicker">How it works</div>
              <h2 class="l-h2">From raw trades to verified, automated edge.</h2>
              <p class="l-p">A single loop that turns every trade you take into measurable, tamper-evident data — and then into rules.</p>
            </div>
            <div class="flow">
              ${[
                ['journal', 'blue', 'Record', 'Log every trade with setup, emotion and notes.'],
                ['ai', 'purple', 'Analyze with AI', 'Surface patterns, leaks and your strongest setups.'],
                ['analytics', 'green', 'Measure', 'Returns, Sharpe, drawdown and risk exposure.'],
                ['shield', 'cyan', 'Verify', 'Hash records and anchor them on a testnet.'],
                ['bolt', 'amber', 'Automate', 'Turn proven rules into smart-contract strategies.'],
              ].map(([ic, c, t, p], i) => `
                <div class="card flow-step reveal" style="transition-delay:${i * 70}ms">
                  <div class="fs-n">0${i + 1}</div>
                  <div class="fs-ico" style="background:${c === 'cyan' ? 'rgba(56,198,232,0.12)' : `var(--${c}-soft)`};color:var(--${c})">${icon(ic)}</div>
                  <h4>${t}</h4><p>${p}</p>
                </div>`).join('')}
            </div>
          </section>

          <section class="l-section" id="trust">
            <div class="grid grid-2" style="align-items:center;gap:40px">
              <div class="reveal">
                <div class="l-kicker">Verification</div>
                <h2 class="l-h2">Performance records you can actually prove.</h2>
                <p class="l-p">Every trade is serialized and hashed with SHA-256. The hash is anchored to a block so any later edit to entry, exit or P&amp;L breaks the match — instantly visible to you or anyone you share it with.</p>
                <p class="l-p" style="font-size:13px"><span class="demo-tag">Demo / Testnet Simulation</span>&nbsp; This prototype simulates the network; nothing is broadcast.</p>
              </div>
              <div class="card card-pad reveal" style="transition-delay:120ms">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
                  <b>TRD-1024 · BTC/USDT</b><span class="badge badge-green">${icon('check')} Verified</span>
                </div>
                <div class="kv-grid">
                  <div class="span-2"><div class="k">Record Hash</div><div class="v mono">${shortHash(D.trades[0].hash, 8, 4)}</div></div>
                  <div><div class="k">Network</div><div class="v">Ethereum Testnet</div></div>
                  <div><div class="k">Block</div><div class="v mono">#18,492,821</div></div>
                </div>
              </div>
            </div>
          </section>

          <section class="card cta-band reveal">
            <h2 class="l-h2" style="margin-top:0;position:relative">Start journaling with proof.</h2>
            <p class="l-p" style="margin:14px auto 0;position:relative">Set up your own journal in under a minute, or explore a fully populated demo first.</p>
            <div class="hero cta" style="padding:0;position:relative"><div class="cta" style="margin-top:28px">
              <a class="btn btn-primary btn-lg" href="#/start">${hasUser() ? 'Open my journal' : 'Create my journal'} ${icon('arrowRight')}</a>
              <a class="btn btn-lg" href="#/dashboard?demo=1">${icon('play')} View demo</a>
            </div></div>
          </section>

          <footer class="l-footer">
            <span>© 2026 TradeChain AI · Frontend prototype</span>
            <span>Blockchain features run as a simulated Ethereum Testnet. Not financial advice.</span>
          </footer>
        </div>
      </div>`;
    },
    mount(root) {
      const nav = root.querySelector('#lnav');
      const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 10);
      window.addEventListener('scroll', onScroll, { passive: true });
      root.querySelectorAll('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        const el = root.querySelector(a.getAttribute('href'));
        if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
      }));
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      }), { threshold: 0.12 });
      root.querySelectorAll('.reveal').forEach((el) => io.observe(el));
      return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); };
    },
  };

  function featureVisualAI() {
    return `<span class="ai-badge">${icon('ai')} Breakout · 74% win</span><span class="badge badge-amber">Size creep</span>`;
  }
  function featureVisualBars() {
    const v = D.monthlyPnl.values;
    const max = Math.max(...v.map(Math.abs));
    return `<div style="display:flex;align-items:center;gap:4px;height:46px;width:100%">${v.map((x) => `<span style="flex:1;height:${Math.max(8, Math.abs(x) / max * 100)}%;border-radius:3px;background:${x >= 0 ? 'var(--green)' : 'var(--red)'};opacity:.8;align-self:${x >= 0 ? 'flex-end' : 'flex-start'}"></span>`).join('')}</div>`;
  }
  function featureVisualHash() {
    return `<span class="mono" style="font-size:11.5px;color:var(--text-2)">0x8A72F9…91FC</span><span style="margin-left:auto" class="badge badge-green">${icon('check')} Match</span>`;
  }
  function featureVisualRule() {
    return `<span class="mono" style="font-size:11.5px"><span class="rule-kw if" style="display:inline-block">IF</span> RSI &lt; 30 <span class="rule-kw then" style="display:inline-block;margin-left:4px">THEN</span> BUY</span>`;
  }

})();
