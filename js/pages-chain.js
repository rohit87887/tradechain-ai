/* ==========================================================================
   TradeChain AI — Blockchain, Automation, Settings
   All blockchain/contract behaviour is simulated locally (Demo / Testnet).
   ========================================================================== */
(function () {
  'use strict';
  const D = window.TC_DATA;
  const { icon, inr, pct, fmtDate, fmtTime, shortHash, esc, assetIcon } = window.UI;
  const PAGES = (window.PAGES = window.PAGES || {});
  const S = () => window.TC_STATE;

  /* ======================================================================
     Blockchain
     ====================================================================== */
  PAGES.blockchain = {
    title: 'Blockchain',
    render() {
      const st = S();
      const M = window.MODEL();
      const cs = M.chain;
      const verified = window.JOURNAL.sortedTrades(st).filter((t) => t.verified);
      const pending = window.JOURNAL.sortedTrades(st).filter((t) => !t.verified);
      const user = st.mode === 'user';
      return `<div class="page">
        <div class="page-head">
          <div><h1 class="page-title">Blockchain Verification <span class="demo-tag">${icon('cube')} Demo · Testnet Simulation</span></h1>
            <p class="page-sub">Verify that your historical trading records have not been modified.</p></div>
          <div class="page-actions">
            ${user ? `<button class="btn" data-create-snapshot ${st.trades.length ? '' : 'disabled'}>${icon('layers')} Publish Snapshot</button>` : ''}
            <button class="btn btn-ai" data-verify-record ${cs.verified ? '' : 'disabled'}>${icon('shield')} Verify Record</button>
          </div>
        </div>

        <div class="grid grid-4 keep-2">
          ${[
            [cs.verified, 'Verified Trades', 'shield', 'green', ''],
            [cs.rate + '%', 'Verification Rate', 'percent', 'blue', ''],
            [cs.snapshots, 'Portfolio Snapshots', 'layers', 'purple', ''],
            [cs.integrity, 'Record Integrity', 'lock', 'green', cs.integrity === '—' ? 'dim' : 'pos'],
          ].map(([v, l, ic, c, cls]) => `<div class="card big-stat">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div><div class="bs-val ${cls}">${v}</div><div class="bs-label">${l}</div></div>
                <span class="stat-ico" style="background:var(--${c}-soft);color:var(--${c})">${icon(ic)}</span>
              </div></div>`).join('')}
        </div>

        <div class="card chain-hero mt">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
            <div><div class="card-title">Latest Blocks</div><div class="card-sub">Ethereum Testnet (simulated) · ~12s block time</div></div>
            <span class="badge badge-green"><span class="dot dot-live"></span> Network synced</span>
          </div>
          <div class="chain-row" data-chain>
            ${M.recentBlocks.slice(-6).map((b, i) => `${i ? '<span class="chain-link"></span>' : ''}<div class="block ${i === 5 ? 'latest' : ''}" style="animation-delay:${i * 70}ms">
                <div class="bn">#${b.number.toLocaleString('en-US')}</div>
                <div class="bh">${b.hash}</div>
                <div class="bt"><span>${b.txs} txs</span><span>${b.age}s ago</span></div>
              </div>`).join('')}
          </div>
        </div>

        ${user && pending.length ? `<div class="card mt">
          <div class="card-head"><div><div class="card-title">Awaiting Verification</div><div class="card-sub">${pending.length} trade${pending.length === 1 ? '' : 's'} not yet anchored on-chain</div></div></div>
          <div class="table-wrap" style="margin-top:12px"><table class="table">
            <thead><tr><th>Trade</th><th>Asset</th><th class="num">P&amp;L</th><th>Date</th><th></th></tr></thead>
            <tbody>${pending.slice(0, 8).map((t) => `<tr>
              <td class="mono" style="font-weight:600">${t.id}</td>
              <td><div class="asset-cell">${assetIcon(t.asset, 26)}<span>${esc(t.asset)}</span></div></td>
              <td class="num ${t.pnl >= 0 ? 'pos' : 'neg'}" style="font-weight:600">${inr(t.pnl, { sign: true })}</td>
              <td class="muted">${fmtDate(t.date)}</td>
              <td style="text-align:right"><button class="btn btn-sm btn-ai" data-verify-trade="${t.id}">${icon('shield')} Verify</button></td></tr>`).join('')}</tbody>
          </table></div>
        </div>` : ''}

        <div class="card mt">
          <div class="card-head">
            <div><div class="card-title">Verified Trade Records</div><div class="card-sub">Click a record to inspect its on-chain proof</div></div>
            ${verified.length ? `<div class="input-wrap" style="width:240px;max-width:100%">${icon('search')}<input class="input" style="height:36px" placeholder="Search ID or hash…" data-chain-search aria-label="Search records"></div>` : ''}
          </div>
          ${verified.length ? `<div class="table-wrap" style="margin-top:14px">
            <table class="table">
              <thead><tr><th>Trade</th><th>Asset</th><th>Hash</th><th>Block</th><th>Date</th><th>Status</th></tr></thead>
              <tbody data-chain-rows>${chainRows(verified.slice(0, 12))}</tbody>
            </table>
          </div>
          <div class="table-foot"><span>Showing latest ${Math.min(12, verified.length)} of ${cs.verified} verified records</span><span class="mono dim">Contract 0x72A4…91FC (TradeRegistry · testnet)</span></div>`
          : window.JOURNAL.emptyState('shield', 'No verified records yet', st.trades.length ? 'Verify a trade above to anchor its hash on the testnet.' : 'Log a trade, then choose “Save &amp; Verify on Blockchain”.', st.trades.length ? '' : '<a class="btn btn-sm btn-primary" href="#/journal">Go to journal</a>')}
        </div>

        <div class="section-title">Verified Portfolio Snapshots <span class="muted" style="font-size:13px;font-weight:400">Merkle roots of your full journal</span></div>
        ${M.snapshots.length ? `<div class="grid grid-4">
          ${M.snapshots.slice(0, 8).map((s) => `<div class="card snapshot">
              <div style="display:flex;justify-content:space-between;align-items:center"><div class="snap-date">${fmtDate(s.date, true).replace(/^(\d+) (\w+) /, '$2 $1, ')}</div><span class="mono dim" style="font-size:11px">${s.id}</span></div>
              <div>
                <div class="muted" style="font-size:12px">Portfolio Value</div>
                <div style="font-size:24px;font-weight:700;letter-spacing:-0.03em">${inr(s.value)}</div>
              </div>
              <div class="kv"><span>Return</span><span class="${s.ret >= 0 ? 'pos' : 'neg'}">${pct(s.ret)}</span></div>
              <div class="kv"><span>Trades</span><span>${s.trades}</span></div>
              <span class="badge badge-green" style="align-self:flex-start">${icon('check')} Blockchain Verified</span>
              <button class="btn btn-sm" data-snapshot="${s.id}">${icon('eye')} View Verification</button>
            </div>`).join('')}
        </div>` : `<div class="card">${window.JOURNAL.emptyState('layers', 'No snapshots yet', 'A snapshot anchors your whole journal — value, return and every trade — as a single Merkle root.', st.trades.length ? `<button class="btn btn-sm btn-primary" data-create-snapshot>${icon('layers')} Publish your first snapshot</button>` : '')}</div>`}
      </div>`;
    },
    mount(root) {
      const bind = () => root.querySelectorAll('[data-chain-trade]').forEach((tr) => tr.addEventListener('click', (e) => {
        if (e.target.closest('.copy-btn')) return;
        const t = S().trades.find((x) => x.id === tr.dataset.chainTrade);
        if (t) openProof(t);
      }));
      bindCopy(root);
      bind();
      const search = root.querySelector('[data-chain-search]');
      if (search) search.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        const list = window.JOURNAL.sortedTrades(S()).filter((t) => t.verified && (!q || t.id.toLowerCase().includes(q) || t.hash.toLowerCase().includes(q) || t.asset.toLowerCase().includes(q)));
        root.querySelector('[data-chain-rows]').innerHTML = list.length ? chainRows(list.slice(0, 12)) : `<tr><td colspan="6"><div class="empty">No records match.</div></td></tr>`;
        bind(); bindCopy(root);
      });
      root.querySelector('[data-verify-record]').addEventListener('click', openVerifyRecord);
      root.querySelectorAll('[data-verify-trade]').forEach((b) => b.addEventListener('click', () => {
        const t = S().trades.find((x) => x.id === b.dataset.verifyTrade);
        if (t) window.JOURNAL.runTradeVerification(t);
      }));
      root.querySelectorAll('[data-create-snapshot]').forEach((b) => b.addEventListener('click', createSnapshot));
      const snaps = window.MODEL().snapshots;
      root.querySelectorAll('[data-snapshot]').forEach((b) => b.addEventListener('click', () => openSnapshot(snaps.find((s) => s.id === b.dataset.snapshot))));
    },
  };

  /* ---------- Publish a portfolio snapshot (simulated) ---------- */
  async function createSnapshot() {
    const st = S();
    if (!st.trades.length) return;
    const M = window.MODEL();
    const leaves = await Promise.all(st.trades.map((t) => t.hash || window.UI.sha256(JSON.stringify({ id: t.id, pnl: t.pnl, date: t.date.toISOString() }))));
    const root = await window.UI.sha256(leaves.sort().join(''));
    const block = window.MODEL_UTIL.blockNow() + 2;
    const snap = {
      id: 'SNP-' + String(st.snapshots.length + 1).padStart(3, '0'),
      date: new Date(), value: Math.round(M.portfolio.value), ret: +M.portfolio.changePct.toFixed(2),
      trades: st.trades.length, block, root,
    };
    const steps = [`Collecting ${snap.trades} trade record${snap.trades === 1 ? '' : 's'}`, 'Building Merkle tree', 'Submitting root to testnet', 'Block confirmed'];
    const m = window.UI.openModal({
      title: 'Publishing Portfolio Snapshot',
      sub: `${snap.id} · <span class="demo-tag">Ethereum Testnet · Simulated</span>`,
      size: 'sm',
      dismissible: false,
      body: `<div class="process-steps">${steps.map((s, i) => `<div class="p-step" data-s="${i}"><span class="p-ico">${i + 1}</span><div class="p-txt"><div class="p-title">${s}</div><div class="p-meta"></div></div></div>`).join('')}</div><div data-out></div>`,
      foot: '<button class="btn" data-close disabled data-done>Please wait…</button>',
    });
    const metas = [`${inr(snap.value)} · ${pct(snap.ret)}`, `${Math.max(1, Math.ceil(Math.log2(snap.trades)))} level${snap.trades > 2 ? 's' : ''} · SHA-256`, 'root ' + shortHash(root, 8, 4), `#${block.toLocaleString('en-US')}`];
    for (let i = 0; i < steps.length; i++) {
      const el = m.querySelector(`[data-s="${i}"]`);
      if (!el) return;
      el.classList.add('active'); el.querySelector('.p-ico').innerHTML = '<span class="spinner"></span>';
      await window.UI.sleep(650);
      el.classList.remove('active'); el.classList.add('done');
      el.querySelector('.p-ico').innerHTML = icon('check');
      el.querySelector('.p-meta').textContent = metas[i];
    }
    st.snapshots.unshift(snap);
    st.notifications.unshift({ kind: 'chain', html: `Portfolio snapshot <b>${snap.id}</b> successfully verified`, time: 'Just now', unread: true });
    m.querySelector('[data-out]').innerHTML = `<div class="result-banner"><span class="rb-ico">${icon('check')}</span><div><div style="font-weight:700" class="pos">✓ Snapshot verified</div><div class="muted" style="font-size:12.5px">Your journal as of now is anchored and tamper-evident.</div></div></div>`;
    window.UI.setDismissible(true);
    const done = m.querySelector('[data-done]');
    done.disabled = false; done.textContent = 'Done';
    window.APP.refresh();
    window.UI.toast(`Snapshot <b>${snap.id}</b> published (testnet sim)`, 'chain');
  }

  function chainRows(list) {
    return list.map((t) => `<tr class="clickable" data-chain-trade="${t.id}">
      <td class="mono" style="font-weight:600">${t.id}</td>
      <td><div class="asset-cell">${assetIcon(t.asset, 26)}<span>${esc(t.asset)}</span></div></td>
      <td><span class="hash">${shortHash(t.hash)}<button class="copy-btn" data-copy="${t.hash}" aria-label="Copy hash">${icon('copy')}</button></span></td>
      <td class="mono muted">#${(t.block || D.BLOCK_TODAY).toLocaleString('en-US')}</td>
      <td class="muted">${fmtDate(t.date)}</td>
      <td><span class="badge badge-green">${icon('check')} Verified</span></td>
    </tr>`).join('');
  }
  function bindCopy(root) {
    root.querySelectorAll('[data-copy]').forEach((b) => {
      if (b.$b) return; b.$b = true;
      b.addEventListener('click', (e) => { e.stopPropagation(); window.UI.copy(b.dataset.copy); });
    });
  }

  /* ---------- Proof modal ---------- */
  function timelineHtml(items) {
    return `<div class="timeline">${items.map(([title, meta, ic], i) => `
      <div class="tl-step ${i === items.length - 1 ? 'final' : ''}" data-tl="${i}">
        <span class="tl-fill"></span>
        <span class="tl-dot">${icon(ic)}</span>
        <div class="tl-text"><div class="tl-title">${title}</div><div class="tl-meta" data-meta="${esc(meta)}"></div></div>
      </div>`).join('')}</div>`;
  }
  async function playTimeline(m) {
    const steps = m.querySelectorAll('[data-tl]');
    for (const s of steps) {
      if (!s.isConnected) return;
      s.classList.add('active');
      await window.UI.sleep(380);
      s.classList.remove('active'); s.classList.add('done');
      const meta = s.querySelector('.tl-meta');
      meta.textContent = meta.dataset.meta;
      await window.UI.sleep(160);
    }
  }

  function openProof(t) {
    const d = t.date;
    const blockTime = new Date(d.getTime() + 41000);
    const m = window.UI.openModal({
      title: '',
      size: 'lg',
      body: `
        <button class="icon-btn" data-close aria-label="Close" style="position:absolute;right:20px;top:20px">${icon('x')}</button>
        <div class="verify-hero">
          <div class="verify-seal">${icon('shield')}</div>
          <div style="font-size:22px;font-weight:700;letter-spacing:-0.02em" class="pos">✓ Blockchain Verified</div>
          <div class="muted" style="margin-top:4px;font-size:13px">Record hash matches the value anchored on-chain · <span class="demo-tag">Testnet simulation</span></div>
        </div>
        <div class="grid grid-2" style="gap:22px;align-items:start">
          <div class="kv-grid">
            <div><div class="k">Trade ID</div><div class="v mono">${t.id}</div></div>
            <div><div class="k">Asset</div><div class="v">${esc(t.asset)}</div></div>
            <div class="span-2"><div class="k">Record Hash</div><div class="v mono" style="display:flex;gap:8px;align-items:center">${shortHash(t.hash, 8, 4)}<button class="copy-btn" data-copy="${t.hash}" aria-label="Copy hash">${icon('copy')}</button></div></div>
            <div><div class="k">Network</div><div class="v">Ethereum Testnet</div></div>
            <div><div class="k">Block</div><div class="v mono">#${(t.block || D.BLOCK_TODAY).toLocaleString('en-US')}</div></div>
            <div><div class="k">Timestamp</div><div class="v">${fmtDate(blockTime, true)}, ${fmtTime(blockTime)}</div></div>
            <div><div class="k">Status</div><div class="v pos" style="letter-spacing:.08em">VERIFIED</div></div>
            <div class="span-2"><div class="k">P&amp;L on record</div><div class="v ${t.pnl >= 0 ? 'pos' : 'neg'}">${inr(t.pnl, { sign: true })} · ${t.type} ${window.UI.price(t.asset, t.entry)} → ${window.UI.price(t.asset, t.exit)}</div></div>
          </div>
          <div>
            <div class="label" style="text-transform:uppercase;letter-spacing:.08em;font-weight:600">Verification timeline</div>
            ${timelineHtml([
              ['Trade Created', `${fmtDate(d, true)}, ${fmtTime(d)}`, 'file'],
              ['Hash Generated', 'SHA-256 · ' + shortHash(t.hash, 6, 4), 'hash'],
              ['Blockchain Submitted', 'tx ' + shortHash(t.tx || '0x' + t.hash.slice(10, 50).toLowerCase(), 8, 6), 'send'],
              ['Block Confirmed', `#${(t.block || D.BLOCK_TODAY).toLocaleString('en-US')} · 12 confirmations`, 'cube'],
              ['✓ Verified', 'Hash match · record unmodified', 'check'],
            ])}
          </div>
        </div>`,
      foot: `<span class="left">${icon('info')} Simulated proof — no real network was contacted.</span>
        <button class="btn" data-recheck>${icon('refresh')} Re-check integrity</button>
        <button class="btn btn-primary" data-close>Done</button>`,
      onMount(mm) { bindCopy(mm); },
    });
    playTimeline(m);
    m.querySelector('[data-recheck]').addEventListener('click', async (e) => {
      const b = e.currentTarget; b.disabled = true;
      b.innerHTML = '<span class="spinner"></span> Recomputing hash…';
      await window.UI.sleep(1100);
      b.disabled = false; b.innerHTML = `${icon('check')} Integrity confirmed`;
      window.UI.toast(`${t.id}: local hash matches on-chain record`, 'chain');
    });
  }

  /* ---------- Verify any record ---------- */
  function openVerifyRecord() {
    const ids = S().trades.filter((t) => t.verified).slice(0, 30);
    const m = window.UI.openModal({
      title: 'Verify Record',
      sub: 'Recompute a record\'s hash locally and compare it with the anchored value.',
      body: `<div class="field"><label>Trade ID or record hash</label>
          <input class="input mono" data-q list="tc-ids" value="TRD-1024" placeholder="TRD-1024 or 0x…">
          <datalist id="tc-ids">${ids.map((t) => `<option value="${t.id}">`).join('')}</datalist></div>
        <div class="muted" style="font-size:12px;margin-top:8px">Tip: try an unverified ID such as <span class="mono">TRD-1025</span> to see a failed check.</div>
        <div data-out style="margin-top:16px"></div>`,
      foot: `<button class="btn" data-close>Cancel</button><button class="btn btn-ai" data-go>${icon('shield')} Verify</button>`,
    });
    const out = m.querySelector('[data-out]');
    const go = m.querySelector('[data-go]');
    go.addEventListener('click', async () => {
      const q = m.querySelector('[data-q]').value.trim().toLowerCase();
      if (!q) return;
      go.disabled = true;
      const steps = ['Fetching on-chain record', 'Recomputing SHA-256 locally', 'Comparing hashes'];
      out.innerHTML = `<div class="process-steps">${steps.map((s, i) => `<div class="p-step" data-s="${i}"><span class="p-ico">${i + 1}</span><div class="p-txt"><div class="p-title">${s}</div></div></div>`).join('')}</div>`;
      const t = S().trades.find((x) => x.id.toLowerCase() === q || (x.hash && x.hash.toLowerCase() === q));
      for (let i = 0; i < steps.length; i++) {
        const el = out.querySelector(`[data-s="${i}"]`);
        if (!el) return;
        el.classList.add('active'); el.querySelector('.p-ico').innerHTML = '<span class="spinner"></span>';
        await window.UI.sleep(650);
        el.classList.remove('active');
        if (i === 0 && !(t && t.verified)) {
          el.querySelector('.p-ico').innerHTML = icon('x'); el.querySelector('.p-ico').style.cssText = 'background:var(--red);border-color:var(--red);color:white';
          el.style.opacity = 1;
          out.insertAdjacentHTML('beforeend', `<div class="result-banner error"><span class="rb-ico">${icon('alert')}</span><div><div style="font-weight:700" class="neg">No on-chain record found</div>
            <div class="muted" style="font-size:12.5px">${t ? `${t.id} exists in your journal but hasn't been anchored yet. Open it in the Trading Journal to verify.` : 'Check the ID or hash and try again.'}</div></div></div>`);
          go.disabled = false;
          return;
        }
        el.classList.add('done'); el.querySelector('.p-ico').innerHTML = icon('check');
      }
      out.insertAdjacentHTML('beforeend', `<div class="result-banner"><span class="rb-ico">${icon('check')}</span><div style="flex:1;min-width:0"><div style="font-weight:700" class="pos">Integrity confirmed — ${t.id}</div>
        <div class="muted mono" style="font-size:11.5px;word-break:break-all">${t.hash}</div></div><button class="btn btn-sm" data-open>View proof</button></div>`);
      out.querySelector('[data-open]').addEventListener('click', () => openProof(t));
      go.disabled = false;
    });
  }

  /* ---------- Snapshot modal ---------- */
  function openSnapshot(s) {
    const m = window.UI.openModal({
      title: `Portfolio Snapshot ${s.id}`,
      sub: `${fmtDate(s.date, true)} · Merkle root of ${s.trades} trade records`,
      size: 'lg',
      body: `<div class="grid grid-2" style="gap:22px;align-items:start">
          <div class="kv-grid">
            <div><div class="k">Portfolio Value</div><div class="v">${inr(s.value)}</div></div>
            <div><div class="k">Return</div><div class="v pos">${pct(s.ret)}</div></div>
            <div><div class="k">Trades Included</div><div class="v">${s.trades}</div></div>
            <div><div class="k">Network</div><div class="v">Ethereum Testnet</div></div>
            <div class="span-2"><div class="k">Merkle Root</div><div class="v mono" style="font-size:12px">${s.root}</div></div>
            <div><div class="k">Block</div><div class="v mono">#${s.block.toLocaleString('en-US')}</div></div>
            <div><div class="k">Status</div><div class="v pos">VERIFIED</div></div>
          </div>
          <div>
            <div class="label" style="text-transform:uppercase;letter-spacing:.08em;font-weight:600">Snapshot pipeline</div>
            ${timelineHtml([
              ['Records Collected', `${s.trades} trades · ${fmtDate(s.date, true)}`, 'layers'],
              ['Merkle Tree Built', `${Math.ceil(Math.log2(s.trades))} levels · SHA-256`, 'hash'],
              ['Root Submitted', shortHash(s.root, 8, 4), 'send'],
              ['Block Confirmed', `#${s.block.toLocaleString('en-US')}`, 'cube'],
              ['✓ Verified', 'Snapshot immutable', 'check'],
            ])}
          </div>
        </div>`,
      foot: `<span class="left"><span class="demo-tag">Testnet simulation</span></span><button class="btn btn-primary" data-close>Done</button>`,
    });
    playTimeline(m);
  }

  window.CHAIN = { openProof };

  /* ======================================================================
     Automation
     ====================================================================== */
  PAGES.automation = {
    title: 'Automation',
    render() {
      const st = S();
      const M = window.MODEL();
      const active = st.automations.filter((a) => a.status === 'active').length;
      return `<div class="page">
        <div class="page-head">
          <div><h1 class="page-title">Smart Trading Automation <span class="demo-tag">Simulated contracts</span></h1>
            <p class="page-sub">Create rule-based strategies that can automatically execute predefined actions.</p></div>
          <div class="page-actions"><button class="btn btn-primary" data-create>${icon('plus')} Create Automation</button></div>
        </div>

        <div class="grid grid-4 keep-2">
          ${[
            [active, 'Active strategies', 'bolt', 'amber'],
            [st.automations.reduce((a, x) => a + x.executions, 0), 'Simulated executions', 'activity', 'blue'],
            [st.automations.length ? inr(st.automations.filter((a) => a.status === 'active').reduce((a, x) => a + x.max, 0)) : '₹0', 'Max capital committed', 'wallet', 'purple'],
            [st.automations.length ? Math.max(...st.automations.map((a) => a.risk)) + '%' : '—', 'Highest risk limit', 'shield', 'green'],
          ].map(([v, l, ic, c]) => `<div class="card big-stat"><div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div><div class="bs-val">${v}</div><div class="bs-label">${l}</div></div>
              <span class="stat-ico" style="background:var(--${c}-soft);color:var(--${c})">${icon(ic)}</span></div></div>`).join('')}
        </div>

        <div class="section-title">${st.automations.length ? 'Strategies' : 'Start from a template'}</div>
        ${st.automations.length ? `<div class="grid grid-2" data-strats>${st.automations.map(strategyCard).join('')}</div>`
          : `<div class="grid grid-3">${TEMPLATES.map((t, i) => `<div class="card strategy-card">
              <div class="sc-head"><div><div class="sc-name">${t.name}</div><div class="muted" style="font-size:12.5px;margin-top:2px">${t.blurb}</div></div></div>
              <div class="rule">
                ${t.conditions.map((c, j) => `<div class="rule-line"><span class="rule-kw ${j ? 'and' : 'if'}">${j ? 'AND' : 'IF'}</span><span>${c.ind} <b style="color:var(--text)">${c.op}</b> ${c.val}</span></div>`).join('')}
                <div class="rule-line"><span class="rule-kw then">THEN</span><span class="${t.action === 'BUY' ? 'pos' : 'neg'}" style="font-weight:700">${t.action}</span></div>
              </div>
              <div class="sc-actions"><button class="btn btn-sm btn-primary" data-template="${i}">${icon('plus')} Use template</button></div>
            </div>`).join('')}</div>`}

        <div class="card mt">
          <div class="card-head"><div><div class="card-title">Execution Log</div><div class="card-sub">Simulated fills — no orders are ever sent to an exchange</div></div></div>
          ${M.executions.length ? `<div class="table-wrap" style="margin-top:12px">
            <table class="table">
              <thead><tr><th>Time</th><th>Contract</th><th>Strategy</th><th>Action</th><th class="num">Amount</th><th class="num">Trigger price</th><th>Result</th></tr></thead>
              <tbody>${M.executions.map((e) => `<tr>
                <td class="muted">${e.time}</td><td class="mono">${e.contract}</td><td>${esc(e.name)}</td>
                <td><span class="type-badge ${e.action.startsWith('BUY') ? 'buy' : 'sell'}">${esc(e.action)}</span></td>
                <td class="num">${inr(e.amount)}</td><td class="num">${e.price}</td>
                <td>${e.result.startsWith('Filled') ? `<span class="badge badge-green">${e.result}</span>` : `<span class="badge badge-amber">${e.result}</span>`}</td></tr>`).join('')}</tbody>
            </table>
          </div>` : window.JOURNAL.emptyState('activity', 'No executions yet', 'When a rule’s conditions are met in the simulation, its execution appears here.')}
        </div>
      </div>`;
    },
    mount(root) {
      root.querySelector('[data-create]').addEventListener('click', () => openCreateAutomation());
      root.querySelectorAll('[data-template]').forEach((b) => b.addEventListener('click', () => openCreateAutomation(TEMPLATES[+b.dataset.template])));
      root.querySelectorAll('[data-strat]').forEach((card) => {
        const a = S().automations.find((x) => x.id === card.dataset.strat);
        card.querySelector('[data-toggle]').addEventListener('click', () => {
          a.status = a.status === 'active' ? 'paused' : 'active';
          window.UI.toast(`${esc(a.name)} ${a.status === 'active' ? 'resumed' : 'paused'}`, a.status === 'active' ? 'success' : 'warn');
          window.APP.refresh();
        });
        card.querySelector('[data-edit]').addEventListener('click', () => openCreateAutomation(a));
        card.querySelector('[data-contract]').addEventListener('click', () => openContract(a));
      });
    },
  };

  const TEMPLATES = [
    { name: 'BTC Oversold Buyer', blurb: 'Buy the dip when momentum is exhausted.', asset: 'BTC', conditions: [{ ind: 'RSI(14)', op: '<', val: '30' }], action: 'BUY', max: 5000, risk: 2 },
    { name: 'ETH Take-Profit Guard', blurb: 'Lock in gains above a target price.', asset: 'ETH', conditions: [{ ind: 'ETH price', op: '>', val: '$3,800' }], action: 'SELL', max: 8000, risk: 1.5 },
    { name: 'NIFTY Trend Follower', blurb: 'Ride the trend when the fast EMA crosses up.', asset: 'NIFTY', conditions: [{ ind: 'EMA(20)', op: 'crosses above', val: 'EMA(50)' }], action: 'BUY', max: 10000, risk: 1 },
  ];

  function strategyCard(a) {
    const isActive = a.status === 'active';
    return `<div class="card strategy-card ${isActive ? '' : 'paused'}" data-strat="${a.id}">
      <div class="sc-head">
        <div style="display:flex;gap:12px;align-items:center;min-width:0">
          ${assetIcon(a.asset === 'NIFTY' ? 'NIFTY 50' : a.asset + '/USDT', 38)}
          <div style="min-width:0"><div class="sc-name">${esc(a.name)}</div><div class="mono dim" style="font-size:11.5px">${a.id} · created ${a.created}</div></div>
        </div>
        <span class="status-pill ${a.status}"><span class="dot ${isActive ? 'dot-live' : ''}"></span>${a.status.toUpperCase()}</span>
      </div>
      <div class="rule">
        ${a.conditions.map((c, i) => `<div class="rule-line"><span class="rule-kw ${i ? 'and' : 'if'}">${i ? 'AND' : 'IF'}</span><span>${esc(c.ind)} <b style="color:var(--text)">${esc(c.op)}</b> ${esc(c.val)}</span></div>`).join('')}
        <div class="rule-line"><span class="rule-kw then">THEN</span><span class="${a.action.startsWith('BUY') ? 'pos' : 'neg'}" style="font-weight:700">${esc(a.action)}</span></div>
      </div>
      <div class="sc-meta">
        <div><div class="k">Maximum Amount</div><div class="v">${inr(a.max)}</div></div>
        <div><div class="k">Risk Limit</div><div class="v">${a.risk}%</div></div>
        <div><div class="k">Executions</div><div class="v">${a.executions} <span class="dim" style="font-size:11.5px;font-weight:400">· ${a.lastRun}</span></div></div>
      </div>
      <div class="sc-actions">
        <button class="btn btn-sm" data-edit>${icon('edit')} Edit</button>
        <button class="btn btn-sm" data-toggle>${isActive ? `${icon('pause')} Pause` : `${icon('play')} Resume`}</button>
        <button class="btn btn-sm btn-ghost" data-contract style="margin-left:auto">${icon('code')} View Contract</button>
      </div>
    </div>`;
  }

  function contractSource(a) {
    const name = a.name.replace(/[^A-Za-z0-9]/g, '');
    const conds = a.conditions.map((c) => `${c.ind} ${c.op} ${c.val}`).join(' AND ');
    const lines = [
      ['cm', '// SPDX-License-Identifier: MIT'],
      ['cm', `// ${a.id} — generated by TradeChain AI (DEMO, not deployed)`],
      ['cm', `// Rule: IF ${conds} THEN ${a.action}`],
      ['raw', '<span class="kw">pragma</span> solidity ^<span class="nu">0.8.24</span>;'],
      ['raw', ''],
      ['raw', `<span class="kw">contract</span> <span class="ty">${esc(name)}</span> {`],
      ['raw', `    <span class="ty">address</span> <span class="kw">public immutable</span> owner;`],
      ['raw', `    <span class="ty">uint256</span> <span class="kw">public constant</span> MAX_INVESTMENT_INR = <span class="nu">${a.max}</span>;`],
      ['raw', `    <span class="ty">uint16</span>  <span class="kw">public constant</span> RISK_LIMIT_BPS = <span class="nu">${Math.round(a.risk * 100)}</span>; <span class="cm">// ${a.risk}%</span>`],
      ['raw', `    <span class="ty">bool</span>    <span class="kw">public</span> active = <span class="kw">${a.status === 'active'}</span>;`],
      ['raw', ''],
      ['raw', `    <span class="kw">event</span> <span class="fn">Executed</span>(<span class="ty">string</span> action, <span class="ty">uint256</span> amount, <span class="ty">uint256</span> price);`],
      ['raw', ''],
      ['raw', `    <span class="kw">function</span> <span class="fn">check</span>(<span class="ty">uint256</span> price, <span class="ty">uint256</span> indicator) <span class="kw">external</span> {`],
      ['raw', `        <span class="kw">require</span>(active, <span class="st">"Strategy paused"</span>);`],
      ['raw', `        <span class="kw">require</span>(<span class="fn">_conditionsMet</span>(price, indicator), <span class="st">"Conditions not met"</span>);`],
      ['raw', `        <span class="ty">uint256</span> amount = <span class="fn">_sizeWithinRisk</span>(MAX_INVESTMENT_INR, RISK_LIMIT_BPS);`],
      ['raw', `        <span class="kw">emit</span> <span class="fn">Executed</span>(<span class="st">"${esc(a.action)}"</span>, amount, price);`],
      ['raw', '    }'],
      ['raw', '}'],
    ];
    return lines.map(([k, l]) => (k === 'cm' ? `<span class="cm">${esc(l)}</span>` : l)).join('\n');
  }

  function openContract(a) {
    window.UI.openModal({
      title: `${a.id} · Smart Contract`,
      sub: `${esc(a.name)} · Ethereum Testnet (simulated) · <span class="demo-tag">Not deployed</span>`,
      size: 'lg',
      body: `<div class="kv-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:16px">
          <div><div class="k">Contract ID</div><div class="v mono">${a.id}</div></div>
          <div><div class="k">Status</div><div class="v ${a.status === 'active' ? 'pos' : 'warn'}">${a.status.toUpperCase()}</div></div>
          <div><div class="k">Gas (est., testnet)</div><div class="v mono">84,210</div></div>
        </div>
        <div class="code">${contractSource(a)}</div>`,
      foot: `<span class="left">${icon('info')} Read-only preview generated in your browser.</span><button class="btn btn-primary" data-close>Close</button>`,
    });
  }

  function openCreateAutomation(existing) {
    const e = existing;
    const isEdit = !!(e && e.id);
    const c0 = e ? e.conditions[0] : null;
    const assets = ['BTC', 'ETH', 'SOL', 'BNB', 'NIFTY'];
    const indicators = ['RSI(14)', 'Price', 'EMA(20)', 'MACD', 'Volume', 'India VIX'];
    const ops = ['<', '>', '≤', '≥', 'crosses above', 'crosses below'];
    const m = window.UI.openModal({
      title: isEdit ? `Edit ${esc(e.name)}` : 'Create Automation',
      sub: 'Define a rule. TradeChain compiles it into a simulated smart contract.',
      body: `<form class="form-grid" data-form novalidate>
          <div class="field span-2"><label>Strategy Name</label><input class="input" name="name" value="${e ? esc(e.name) : 'BTC Oversold Buyer'}"></div>
          <div class="field"><label>Asset</label><select class="select" name="asset">${assets.map((x) => `<option ${e && e.asset === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Indicator</label><select class="select" name="ind">${indicators.map((x) => `<option ${c0 && c0.ind.includes(x.replace(/\(.*/, '')) ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Condition</label><select class="select" name="op">${ops.map((x) => `<option ${c0 && c0.op === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Threshold</label><input class="input" name="val" value="${c0 ? esc(c0.val) : '30'}"></div>
          <div class="field span-2"><label>Action</label>
            <div class="toggle-group" data-action-t>
              <button type="button" class="buy ${!e || e.action.startsWith('BUY') ? 'active' : ''}" data-v="BUY">BUY</button>
              <button type="button" class="sell ${e && e.action.startsWith('SELL') ? 'active' : ''}" data-v="SELL">SELL</button></div></div>
          <div class="field"><label>Maximum Investment</label><div class="input-prefix"><span>₹</span><input class="input" name="max" type="number" min="0" value="${e ? e.max : 5000}"></div></div>
          <div class="field"><label>Risk Limit <span class="dim" data-risk-v>${e ? e.risk : 2}%</span></label>
            <input class="range" name="risk" type="range" min="0.5" max="5" step="0.5" value="${e ? e.risk : 2}" style="margin-top:14px"></div>
          <div class="field span-2"><label>Rule preview</label><div class="rule-preview" data-preview></div></div>
        </form>
        <div data-progress></div>`,
      foot: `<span class="left">${icon('lock')} Nothing is deployed — <span class="demo-tag">Simulation</span></span>
        <button class="btn" data-close>Cancel</button>
        <button class="btn btn-ai" data-submit>${icon('code')} ${isEdit ? 'Update Smart Contract' : 'Create Smart Contract'}</button>`,
    });
    const form = m.querySelector('[data-form]');
    let action = !e || e.action.startsWith('BUY') ? 'BUY' : 'SELL';
    const pv = m.querySelector('[data-preview]');
    function preview() {
      m.querySelector('[data-risk-v]').textContent = form.risk.value + '%';
      pv.innerHTML = `<b style="color:var(--blue)">IF</b> ${esc(form.asset.value)} ${esc(form.ind.value)} <b>${esc(form.op.value)}</b> ${esc(form.val.value || '…')}
        <b style="color:var(--amber)">THEN</b> <span class="${action === 'BUY' ? 'pos' : 'neg'}">${action}</span>
        · max ${inr(+form.max.value || 0)} · risk ${form.risk.value}%`;
    }
    form.addEventListener('input', preview);
    m.querySelectorAll('[data-action-t] button').forEach((b) => b.addEventListener('click', () => {
      action = b.dataset.v;
      m.querySelectorAll('[data-action-t] button').forEach((x) => x.classList.toggle('active', x === b));
      preview();
    }));
    preview();

    m.querySelector('[data-submit]').addEventListener('click', async (ev) => {
      if (!form.val.value.trim() || !(+form.max.value > 0) || !form.name.value.trim()) {
        window.UI.toast('Name, threshold and maximum investment are required', 'warn'); return;
      }
      const btn = ev.currentTarget; btn.disabled = true;
      window.UI.setDismissible(false);
      form.style.display = 'none';
      const id = isEdit ? e.id : 'SC-' + window.UI.randHex(7);
      const prog = m.querySelector('[data-progress]');
      const steps = ['Rules validated', 'Contract generated', 'Strategy activated'];
      prog.innerHTML = `<div style="text-align:center;margin-bottom:16px"><div class="spinner" style="width:28px;height:28px;margin:0 auto 10px;border-width:3px" data-spin></div>
          <div style="font-weight:600" data-ptitle>${isEdit ? 'Updating' : 'Creating'} Smart Contract...</div></div>
        <div class="process-steps">${steps.map((s, i) => `<div class="p-step" data-s="${i}"><span class="p-ico">${i + 1}</span><div class="p-txt"><div class="p-title">${s}</div></div></div>`).join('')}</div>`;
      for (let i = 0; i < steps.length; i++) {
        const el = prog.querySelector(`[data-s="${i}"]`);
        if (!el) return;
        el.classList.add('active');
        await window.UI.sleep(750);
        el.classList.remove('active'); el.classList.add('done');
        el.querySelector('.p-ico').innerHTML = icon('check');
      }
      prog.querySelector('[data-spin]').outerHTML = `<div class="verify-seal" style="width:56px;height:56px">${icon('check')}</div>`;
      prog.querySelector('[data-ptitle]').innerHTML = `<span class="pos">Smart Contract ${isEdit ? 'Updated' : 'Created'}</span>
        <div class="muted" style="font-weight:400;font-size:13px;margin-top:6px">Contract ID</div><div class="mono" style="font-size:18px;font-weight:700">${id}</div>`;
      const data = {
        id, name: form.name.value.trim(), asset: form.asset.value,
        conditions: [{ ind: form.ind.value === 'Price' ? `${form.asset.value} price` : form.ind.value, op: form.op.value, val: form.val.value.trim() }],
        action, max: +form.max.value, risk: +form.risk.value, status: 'active',
        executions: isEdit ? e.executions : 0, lastRun: isEdit ? e.lastRun : 'never', created: isEdit ? e.created : fmtDate(new Date(), true),
      };
      const st = S();
      if (isEdit) Object.assign(e, data); else st.automations.unshift(data);
      if (!isEdit) st.notifications.unshift({ kind: 'auto', html: `Smart contract <b>${id}</b> created for ${esc(data.name)}`, time: 'Just now', unread: true });
      window.UI.setDismissible(true);
      btn.outerHTML = `<button class="btn btn-primary" data-close>Done</button>`;
      m.querySelector('.modal-foot [data-close]:last-child').addEventListener('click', () => window.UI.closeModal());
      window.APP.refresh();
      window.UI.toast(`Strategy <b>${esc(data.name)}</b> is active (simulated)`, 'success');
    });
  }

  /* ======================================================================
     Settings
     ====================================================================== */
  PAGES.settings = {
    title: 'Settings',
    render() {
      const u = S().user;
      return `<div class="page">
        <div class="page-head"><div><h1 class="page-title">Settings</h1><p class="page-sub">Manage your profile, trading preferences and demo wallet.</p></div></div>
        <div class="settings-grid">
          <nav class="settings-nav">
            <a href="#s-profile" class="active" data-jump>${icon('user')} Profile</a>
            <a href="#s-trading" data-jump>${icon('sliders')} Trading Preferences</a>
            <a href="#s-chain" data-jump>${icon('chain')} Blockchain</a>
            <a href="#s-notif" data-jump>${icon('bell')} Notifications</a>
            <a href="#s-data" data-jump>${icon('layers')} Data</a>
          </nav>
          <div class="stack">
            <div class="card card-pad" id="s-profile">
              <div class="card-title">Profile</div><div class="card-sub" style="margin-bottom:18px">Shown on shared performance reports.</div>
              <div class="profile-pic" style="margin-bottom:20px">
                <div class="avatar" data-avatar-preview style="${u.avatar ? `background-image:url(${u.avatar})` : ''}">${u.avatar ? '' : esc(initials(u.name))}</div>
                <div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm" data-upload>${icon('camera')} Upload photo</button>
                  ${u.avatar ? `<button class="btn btn-sm btn-ghost" data-remove-photo>Remove</button>` : ''}</div>
                  <div class="dim" style="font-size:12px;margin-top:6px">PNG or JPG. Stays in your browser.</div></div>
                <input type="file" accept="image/*" hidden data-file>
              </div>
              <div class="form-grid">
                <div class="field"><label>Name</label><input class="input" name="name" value="${esc(u.name)}"></div>
                <div class="field"><label>Email</label><input class="input" name="email" type="email" value="${esc(u.email)}"></div>
              </div>
            </div>

            <div class="card card-pad" id="s-trading">
              <div class="card-title">Trading Preferences</div><div class="card-sub" style="margin-bottom:18px">Defaults applied to new trades and AI analysis.</div>
              <div class="form-grid">
                <div class="field"><label>Starting capital</label><div class="input-prefix"><span>₹</span><input class="input" name="capital" type="number" min="1000" step="1000" value="${u.capital || ''}" ${S().mode === 'demo' ? 'disabled' : ''}></div></div>
                <div class="field"><label>Default currency</label><select class="select" name="currency">${['INR (₹)', 'USD ($)', 'USDT'].map((c) => `<option ${u.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
                <div class="field span-2"><label>Default strategy</label><select class="select" name="defaultStrategy">${D.STRATEGIES.map((s) => `<option ${u.defaultStrategy === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
                <div class="field span-2"><label>Risk tolerance</label>
                  <div class="toggle-group" data-risk>${['Conservative', 'Moderate', 'Aggressive'].map((r) => `<button type="button" class="neutral ${u.risk === r ? 'active' : ''}" data-v="${r}">${r}</button>`).join('')}</div></div>
                <div class="field span-2"><label>Max risk per trade <span class="dim" data-mr>${u.maxRisk}%</span></label>
                  <input class="range" type="range" min="0.5" max="5" step="0.5" value="${u.maxRisk}" name="maxRisk"></div>
              </div>
            </div>

            <div class="card card-pad" id="s-chain">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:18px">
                <div><div class="card-title">Blockchain</div><div class="card-sub">Demo wallet used for simulated verification.</div></div>
                <span class="demo-tag">Demo Wallet</span>
              </div>
              <div class="wallet-card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;position:relative;z-index:1">
                  <div>
                    <div class="muted" style="font-size:12px">Wallet Status</div>
                    <div style="font-weight:650;font-size:16px;display:flex;align-items:center;gap:8px;margin-top:2px" data-wstatus>
                      ${u.walletConnected ? '<span class="dot dot-live" style="color:var(--green)"></span> Demo Wallet Connected' : '<span class="dot" style="color:var(--dim)"></span> Disconnected'}</div>
                  </div>
                  <button class="btn btn-sm" data-wallet-toggle>${u.walletConnected ? 'Disconnect' : 'Connect demo wallet'}</button>
                </div>
                <div class="grid grid-2" style="margin-top:20px;gap:12px;position:relative;z-index:1">
                  <div><div class="muted" style="font-size:12px">Network</div><div style="font-weight:600">Ethereum Testnet</div></div>
                  <div><div class="muted" style="font-size:12px">Wallet</div><div class="mono" style="font-weight:600;display:flex;gap:6px;align-items:center">0x72A...91FC <button class="copy-btn" data-copy="0x72A4c3E19b0D5f8a6E2B7c91d0F43aE8b2c591FC" aria-label="Copy address">${icon('copy')}</button></div></div>
                </div>
              </div>
              <div class="setting-row" style="margin-top:8px"><div><div class="sr-t">Auto-verify new trades</div><div class="sr-d">Anchor each trade's hash as soon as it's saved.</div></div>
                <label class="switch"><input type="checkbox" ${u.autoVerify ? 'checked' : ''} name="autoVerify"><span></span></label></div>
              <div class="setting-row"><div><div class="sr-t">Monthly portfolio snapshots</div><div class="sr-d">Publish a Merkle root of your journal on the 1st of every month.</div></div>
                <label class="switch"><input type="checkbox" checked name="snapshots"><span></span></label></div>
              <div class="muted" style="font-size:12px;margin-top:10px">${icon('lock', 'info-tip')} This prototype never asks for or stores private keys or seed phrases.</div>
            </div>

            <div class="card card-pad" id="s-notif">
              <div class="card-title">Notifications</div><div class="card-sub" style="margin-bottom:6px">Choose what you hear about.</div>
              ${[['Blockchain confirmations', 'When a trade or snapshot is verified', true], ['AI insights', 'New patterns, weekly summaries', true], ['Risk alerts', 'Exposure above your configured limit', true], ['Automation executions', 'Every simulated contract execution', false]].map(([t, d, on]) => `
                <div class="setting-row"><div><div class="sr-t">${t}</div><div class="sr-d">${d}</div></div><label class="switch"><input type="checkbox" ${on ? 'checked' : ''}><span></span></label></div>`).join('')}
            </div>

            ${S().mode === 'user' ? `<div class="card card-pad danger-zone" id="s-data">
              <div class="card-title">Your data</div><div class="card-sub" style="margin-bottom:6px">Your journal lives only in this browser (localStorage). Export it regularly as a backup.</div>
              <div class="setting-row"><div><div class="sr-t">Export journal</div><div class="sr-d">Download all ${S().trades.length} trades as CSV — you can import it again later.</div></div>
                <button class="btn btn-sm" data-export-ws>${icon('download')} Export CSV</button></div>
              <div class="setting-row"><div><div class="sr-t neg">Reset workspace</div><div class="sr-d">Permanently remove your trades, snapshots and automations from this browser.</div></div>
                <button class="btn btn-sm btn-danger" data-reset-ws>${icon('x')} Reset</button></div>
            </div>` : `<div class="card card-pad" id="s-data">
              <div class="card-title">You're in the demo workspace</div><div class="card-sub" style="margin-bottom:14px">Changes here aren't saved. Create your own journal to track real performance.</div>
              <a class="btn btn-primary" href="#/start">${icon('plus')} ${window.APP.hasUser() ? 'Go to my journal' : 'Create my journal'}</a>
            </div>`}

            <div style="display:flex;justify-content:flex-end;gap:10px">
              <button class="btn" data-reset>Discard changes</button>
              <button class="btn btn-primary" data-save>${icon('check')} Save changes</button>
            </div>
          </div>
        </div>
      </div>`;
    },
    mount(root) {
      const u = S().user;
      const draft = { risk: u.risk, avatar: u.avatar };
      bindCopy(root);
      root.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        root.querySelectorAll('[data-jump]').forEach((x) => x.classList.toggle('active', x === a));
        const el = root.querySelector(a.getAttribute('href'));
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
      }));
      root.querySelectorAll('[data-risk] button').forEach((b) => b.addEventListener('click', () => {
        draft.risk = b.dataset.v;
        root.querySelectorAll('[data-risk] button').forEach((x) => x.classList.toggle('active', x === b));
      }));
      const mr = root.querySelector('[name=maxRisk]');
      mr.addEventListener('input', () => { root.querySelector('[data-mr]').textContent = mr.value + '%'; });
      const file = root.querySelector('[data-file]');
      root.querySelector('[data-upload]').addEventListener('click', () => file.click());
      file.addEventListener('change', () => {
        const f = file.files[0]; if (!f || !f.type.startsWith('image/')) return;
        const r = new FileReader();
        r.onload = () => {
          draft.avatar = r.result;
          const p = root.querySelector('[data-avatar-preview]');
          p.style.backgroundImage = `url(${r.result})`; p.textContent = '';
        };
        r.readAsDataURL(f);
      });
      const rm = root.querySelector('[data-remove-photo]');
      if (rm) rm.addEventListener('click', () => { u.avatar = null; window.APP.refresh(); });
      root.querySelector('[data-wallet-toggle]').addEventListener('click', () => {
        u.walletConnected = !u.walletConnected;
        window.UI.toast(u.walletConnected ? 'Demo wallet connected (testnet)' : 'Demo wallet disconnected', u.walletConnected ? 'chain' : 'warn');
        window.APP.refresh();
      });
      root.querySelector('[data-reset]').addEventListener('click', () => window.APP.refresh());
      const exp = root.querySelector('[data-export-ws]');
      if (exp) exp.addEventListener('click', () => window.JOURNAL.exportCsv());
      const rs = root.querySelector('[data-reset-ws]');
      if (rs) rs.addEventListener('click', () => {
        if (!rs.dataset.armed) { rs.dataset.armed = '1'; rs.innerHTML = `${icon('alert')} Click again to confirm`; return; }
        window.APP.resetUser();
        location.hash = '#/';
        window.UI.toast('Workspace reset — your journal was removed from this browser', 'warn');
      });
      root.querySelector('[data-save]').addEventListener('click', () => {
        const name = root.querySelector('[name=name]').value.trim();
        const email = root.querySelector('[name=email]').value.trim();
        if (!name) { window.UI.toast('Name cannot be empty', 'warn'); return; }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { window.UI.toast('Enter a valid email address', 'warn'); return; }
        const capEl = root.querySelector('[name=capital]');
        const capital = capEl && !capEl.disabled ? parseFloat(capEl.value) : u.capital;
        if (!(capital >= 1000)) { window.UI.toast('Starting capital must be at least ₹1,000', 'warn'); return; }
        Object.assign(u, {
          name, email, capital, greetName: S().mode === 'user' ? name.split(/\s+/)[0] : u.greetName,
          currency: root.querySelector('[name=currency]').value,
          defaultStrategy: root.querySelector('[name=defaultStrategy]').value,
          risk: draft.risk, maxRisk: +mr.value, avatar: draft.avatar,
          autoVerify: root.querySelector('[name=autoVerify]').checked,
        });
        window.APP.refresh();
        window.UI.toast('Settings saved locally');
      });
    },
  };

  function initials(n) { return n.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join(''); }
  window.CHAIN.initials = initials;
})();
