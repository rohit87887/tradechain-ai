# TradeChain AI

**Analyze. Verify. Trade Smarter.**

An AI-powered trading journal and portfolio performance analyser with blockchain-verified performance records and smart-contract-style strategy automation.

This is a **frontend-only prototype**: there is no backend, database or real wallet. Blockchain anchoring and smart-contract execution are **simulated**; trade-record hashes are real SHA-256 values computed in the browser.

## Features

- **Two workspaces**
  - **My journal:** a new user signs up in 3 steps (name, starting capital, trading style) and starts with an empty journal. Everything is calculated from their own trades and saved in the browser (`localStorage`).
  - **Demo:** a fully populated sample journal (synthetic data) to explore every screen.
- **Trading Journal:** add trades with entry/exit, quantity, stop loss, take profit, strategy, emotion and notes. Includes search, filters, CSV import/export and delete.
- **Dashboard and Analytics:** portfolio value, P&L, win rate, profit factor, risk/reward, Sharpe ratio, max drawdown, equity curve, monthly P&L, strategy/asset breakdowns and a trading-hour heatmap.
- **AI Insights:** a rule-based behavioural score from 5 sub-scores (strategy edge, discipline, consistency, emotional control, risk management). Insights unlock after 5 trades, and the score is pulled toward average until 20 trades so small samples don't produce misleading ratings.
- **Blockchain verification (simulated testnet):** each trade is hashed with SHA-256, so any edit is detectable. Portfolio snapshots combine all trade hashes into one root.
- **Automation:** IF / AND / THEN rules compiled into a smart-contract preview, with pause, resume and edit.

## Run it

No build step. Serve the folder with any static server:

```bash
python -m http.server 8850
```

Then open <http://localhost:8850>. Opening `index.html` directly also works. Charts and fonts load from public CDNs, so an internet connection is needed.

## Project structure

```
index.html              entry point
css/styles.css          design system and app shell
css/workspace.css       onboarding, checklist and empty states
js/data.js              demo data (seeded, synthetic)
js/ui.js                icons, formatting, modals, toasts, charts, SHA-256
js/model.js             analytics and behavioural-scoring engine
js/pages-landing.js     landing page
js/pages-onboard.js     new-user sign-up
js/pages-core.js        dashboard, journal, CSV import/export, verification flow
js/pages-analytics.js   analytics and AI insights
js/pages-chain.js       blockchain, automation, settings
js/app.js               workspaces, storage and router
```

## Tech

HTML, CSS and vanilla JavaScript; Chart.js 4.4.1; Web Crypto API (SHA-256); browser localStorage.
