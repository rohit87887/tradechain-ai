/* ==========================================================================
   TradeChain AI — New-user onboarding (#/start)
   Creates the visitor's own workspace, stored in this browser only.
   ========================================================================== */
(function () {
  'use strict';
  const D = window.TC_DATA;
  const { icon, inr, esc } = window.UI;
  const PAGES = (window.PAGES = window.PAGES || {});

  const draft = { name: '', email: '', experience: 'Beginner', portfolio: 'My Portfolio', capital: 100000, markets: ['crypto', 'india'], strategy: 'Breakout', risk: 'Moderate', maxRisk: 1 };
  let step = 0;

  const STEPS = ['About you', 'Your portfolio', 'Trading style'];

  function stepBody() {
    if (step === 0) {
      return `<h2 class="ob-h">Let's set up your journal</h2>
        <p class="muted ob-p">A few details to personalise your dashboard. Everything stays in this browser.</p>
        <div class="form-grid" style="margin-top:22px">
          <div class="field span-2"><label>Your name</label><input class="input" name="name" maxlength="40" placeholder="e.g. Aarav Sharma" value="${esc(draft.name)}" autocomplete="name"></div>
          <div class="field span-2"><label>Email <span class="dim">(optional, never sent anywhere)</span></label><input class="input" name="email" type="email" maxlength="80" placeholder="you@example.com" value="${esc(draft.email)}" autocomplete="email"></div>
          <div class="field span-2"><label>Trading experience</label>
            <div class="option-cards" data-opt="experience">
              ${[['Beginner', 'Less than 1 year', '🌱'], ['Intermediate', '1–3 years', '📈'], ['Advanced', '3+ years', '🏆']].map(([v, d, e]) => `
                <button type="button" class="option-card ${draft.experience === v ? 'active' : ''}" data-v="${v}"><span class="oc-emoji">${e}</span><b>${v}</b><small>${d}</small></button>`).join('')}
            </div></div>
        </div>`;
    }
    if (step === 1) {
      return `<h2 class="ob-h">Your portfolio</h2>
        <p class="muted ob-p">Starting capital is the baseline for returns, drawdown and risk-per-trade.</p>
        <div class="form-grid" style="margin-top:22px">
          <div class="field span-2"><label>Portfolio name</label><input class="input" name="portfolio" maxlength="32" value="${esc(draft.portfolio)}"></div>
          <div class="field span-2"><label>Starting capital</label>
            <div class="input-prefix"><span>₹</span><input class="input" name="capital" type="number" min="1000" step="1000" value="${draft.capital}"></div>
            <div class="chip-group" style="margin-top:8px">${[25000, 50000, 100000, 250000, 500000].map((v) => `<button type="button" class="chip ${draft.capital === v ? 'active' : ''}" data-cap="${v}">${window.UI.inrCompact(v)}</button>`).join('')}</div>
          </div>
          <div class="field span-2"><label>Markets you trade</label>
            <div class="option-cards two" data-multi="markets">
              ${[['crypto', 'Crypto', 'BTC, ETH, SOL, BNB, XRP', 'bolt'], ['india', 'Indian markets', 'NIFTY, BANK NIFTY, RELIANCE, TCS…', 'trendUp']].map(([v, l, d, ic]) => `
                <button type="button" class="option-card row ${draft.markets.includes(v) ? 'active' : ''}" data-v="${v}"><span class="stat-ico" style="background:var(--blue-soft);color:var(--blue)">${icon(ic)}</span><span style="text-align:left"><b>${l}</b><small>${d}</small></span><span class="oc-check">${icon('check')}</span></button>`).join('')}
            </div></div>
        </div>`;
    }
    return `<h2 class="ob-h">Your trading style</h2>
      <p class="muted ob-p">Used as defaults for new trades and as the benchmark for AI risk warnings.</p>
      <div class="form-grid" style="margin-top:22px">
        <div class="field span-2"><label>Main strategy</label>
          <div class="chip-group" data-opt="strategy">${D.STRATEGIES.map((s) => `<button type="button" class="chip ${draft.strategy === s ? 'active' : ''}" data-v="${s}">${s}</button>`).join('')}</div></div>
        <div class="field span-2"><label>Risk tolerance</label>
          <div class="toggle-group" data-opt="risk">${['Conservative', 'Moderate', 'Aggressive'].map((r) => `<button type="button" class="neutral ${draft.risk === r ? 'active' : ''}" data-v="${r}">${r}</button>`).join('')}</div></div>
        <div class="field span-2"><label>Max risk per trade <span class="dim" data-mr>${draft.maxRisk}% · ${inr(Math.round(draft.capital * draft.maxRisk / 100))}</span></label>
          <input class="range" type="range" min="0.5" max="5" step="0.5" value="${draft.maxRisk}" name="maxRisk" style="margin-top:10px"></div>
      </div>
      <div class="ob-summary">
        <div><span class="muted">Trader</span><b>${esc(draft.name || '—')}</b></div>
        <div><span class="muted">Portfolio</span><b>${esc(draft.portfolio)}</b></div>
        <div><span class="muted">Capital</span><b>${inr(draft.capital)}</b></div>
        <div><span class="muted">Wallet</span><b>Demo · Testnet</b></div>
      </div>`;
  }

  PAGES.start = {
    shell: false,
    title: 'Create your journal',
    render() {
      step = 0;
      return `<div class="onboard">
        <div class="ob-top">
          <a class="brand" href="#/" style="padding:0"><span class="brand-mark">${icon('chain')}</span><span class="brand-name">TradeChain <span>AI</span></span></a>
          <a class="btn btn-ghost btn-sm" href="#/dashboard?demo=1">${icon('eye')} <span class="hide-sm">Explore the demo instead</span><span class="show-sm">View demo</span></a>
        </div>
        <div class="ob-wrap">
          <aside class="ob-side hide-sm">
            <div class="l-kicker">New journal</div>
            <h1 style="font-size:30px;letter-spacing:-0.03em;margin-top:10px;line-height:1.15">Your trading,<br>measured and verified.</h1>
            <ul class="ob-list">
              ${[['journal', 'A private journal that starts empty — only your trades'], ['analytics', 'Live analytics: win rate, drawdown, Sharpe, P&amp;L'], ['ai', 'AI insights unlock after your 5th trade'], ['shield', 'Optional on-chain verification (testnet simulation)']]
                .map(([ic, t]) => `<li><span class="stat-ico" style="background:var(--surface-2);color:var(--blue)">${icon(ic)}</span>${t}</li>`).join('')}
            </ul>
            <div class="muted" style="font-size:12.5px;margin-top:auto">${icon('lock', 'info-tip')} No account, no server. Data is stored in this browser's local storage.</div>
          </aside>
          <main class="card ob-card">
            <div class="ob-steps">${STEPS.map((s, i) => `<div class="ob-step" data-i="${i}"><span>${i + 1}</span>${s}</div>`).join('')}</div>
            <form data-ob novalidate></form>
            <div class="ob-foot">
              <button class="btn btn-ghost" data-back>Back</button>
              <button class="btn btn-primary" data-next>Continue ${icon('arrowRight')}</button>
            </div>
          </main>
        </div>
      </div>`;
    },
    mount(root) {
      const form = root.querySelector('[data-ob]');
      const next = root.querySelector('[data-next]');
      const back = root.querySelector('[data-back]');
      function paint() {
        form.innerHTML = stepBody();
        form.classList.remove('ob-anim'); void form.offsetWidth; form.classList.add('ob-anim');
        root.querySelectorAll('.ob-step').forEach((el) => {
          const i = +el.dataset.i;
          el.classList.toggle('active', i === step);
          el.classList.toggle('done', i < step);
        });
        back.style.visibility = step ? 'visible' : 'hidden';
        next.innerHTML = step === STEPS.length - 1 ? `${icon('check')} Create my journal` : `Continue ${icon('arrowRight')}`;
        bind();
        const first = form.querySelector('input');
        if (first && step < 2 && window.innerWidth > 760) first.focus();
      }
      function bind() {
        form.querySelectorAll('[data-opt]').forEach((g) => g.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
          draft[g.dataset.opt] = b.dataset.v;
          g.querySelectorAll('[data-v]').forEach((x) => x.classList.toggle('active', x === b));
        })));
        form.querySelectorAll('[data-multi]').forEach((g) => g.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
          const arr = draft[g.dataset.multi];
          const v = b.dataset.v;
          const i = arr.indexOf(v);
          if (i >= 0 && arr.length > 1) arr.splice(i, 1); else if (i < 0) arr.push(v);
          b.classList.toggle('active', arr.includes(v));
        })));
        form.querySelectorAll('[data-cap]').forEach((b) => b.addEventListener('click', () => {
          draft.capital = +b.dataset.cap;
          form.capital.value = draft.capital;
          form.querySelectorAll('[data-cap]').forEach((x) => x.classList.toggle('active', x === b));
        }));
        if (form.capital) form.capital.addEventListener('input', () => {
          form.capital.classList.remove('invalid');
          form.querySelectorAll('[data-cap]').forEach((x) => x.classList.toggle('active', +x.dataset.cap === +form.capital.value));
        });
        if (form.name) form.name.addEventListener('input', () => form.name.classList.remove('invalid'));
        if (form.maxRisk) form.maxRisk.addEventListener('input', () => {
          draft.maxRisk = +form.maxRisk.value;
          form.querySelector('[data-mr]').textContent = `${draft.maxRisk}% · ${inr(Math.round(draft.capital * draft.maxRisk / 100))}`;
        });
      }
      function collect() {
        if (step === 0) {
          const name = form.name.value.trim();
          const email = form.email.value.trim();
          if (name.length < 2) { form.name.classList.add('invalid'); window.UI.toast('Please enter your name', 'warn'); return false; }
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { form.email.classList.add('invalid'); window.UI.toast('That email doesn’t look right', 'warn'); return false; }
          draft.name = name; draft.email = email;
        }
        if (step === 1) {
          const cap = parseFloat(form.capital.value);
          if (!(cap >= 1000)) { form.capital.classList.add('invalid'); window.UI.toast('Starting capital must be at least ₹1,000', 'warn'); return false; }
          if (cap > 1e10) { form.capital.classList.add('invalid'); window.UI.toast('That capital looks too large', 'warn'); return false; }
          draft.capital = Math.round(cap);
          draft.portfolio = form.portfolio.value.trim() || 'My Portfolio';
        }
        return true;
      }
      async function go() {
        if (!collect()) return;
        if (step < STEPS.length - 1) { step++; paint(); return; }
        next.disabled = true; back.disabled = true;
        const card = root.querySelector('.ob-card');
        const lines = ['Creating your private journal', 'Setting up analytics engine', 'Connecting demo wallet (testnet)', 'Ready'];
        card.innerHTML = `<div class="ob-creating">
          <div class="verify-seal" style="width:64px;height:64px">${icon('chain')}</div>
          <h2 class="ob-h" style="text-align:center">Setting things up, ${esc(draft.name.split(' ')[0])}…</h2>
          <div class="process-steps" style="margin-top:20px">${lines.map((l, i) => `<div class="p-step" data-s="${i}"><span class="p-ico">${i + 1}</span><div class="p-txt"><div class="p-title">${l}</div></div></div>`).join('')}</div>
        </div>`;
        for (let i = 0; i < lines.length; i++) {
          const el = card.querySelector(`[data-s="${i}"]`);
          if (!el) return;
          el.classList.add('active'); el.querySelector('.p-ico').innerHTML = '<span class="spinner"></span>';
          await window.UI.sleep(i === lines.length - 1 ? 250 : 520);
          el.classList.remove('active'); el.classList.add('done'); el.querySelector('.p-ico').innerHTML = icon('check');
        }
        window.APP.createUser({ ...draft, markets: draft.markets.slice() });
        await window.UI.sleep(300);
        location.hash = '#/dashboard';
        setTimeout(() => window.UI.toast(`Welcome, <b>${esc(draft.name.split(' ')[0])}</b>! Your journal is ready.`, 'success'), 400);
      }
      form.addEventListener('submit', (e) => { e.preventDefault(); go(); });
      next.addEventListener('click', go);
      back.addEventListener('click', () => { if (step) { step--; paint(); } });
      paint();
    },
  };
})();
