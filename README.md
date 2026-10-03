# QuantPulse

Institutional-grade analytics for stocks and ETFs: returns, risk and distribution statistics computed entirely in the browser from Yahoo Finance data. QuantPulse is a static SvelteKit SPA served by Nginx; it has no application backend.

## Features

- **Quote header:** live price, change, volume and 52-week range, refreshed every 30 s while the tab is visible.
- **Metric cards:** CAGR, volatility, Sharpe, Sortino, maximum and current drawdown, 1-day historical VaR 95% and share of positive days.
- **Statistics tables:** trailing returns (1M–5Y, YTD), Calmar, drawdown episode dates and duration, VaR 99%, expected shortfall, skewness, excess kurtosis, and best/worst sessions and months.
- **Bar charts (dependency-free SVG):** daily returns, monthly returns and weekday seasonality, with hover and arrow-key scrubbing.
- **Monthly calendar:** a year × month returns heatmap with compounded yearly totals.
- **Contribution timing:** finds which day of the month has historically been cheapest for a recurring contribution. Each day's execution price is compared with its month's average close, and orders on non-trading days execute at the next session. Shown overall (days 1–31), by month of the year, and year by year for any chosen month.
- **Watchlist and recent tickers:** stored in `localStorage`. Deep links work, e.g. `/AAPL?range=5Y`.
- **Loading:** a progress bar that follows the real loading stages, plus skeletons sized to the final layout so nothing shifts.
- **English and Spanish:** the language follows the browser by default and can be switched in the header; the choice is remembered, and numbers and dates use the locale's format (`en-US` / `es-ES`).
- **Accessibility and theming:** light and dark themes; WCAG AA text contrast; gains and losses shown by sign and position as well as color.

## Architecture

```
 ┌──────────────────────────── ui (Svelte 5 runes) ─────────────────────────────┐
 │ routes · components · sections · state controllers · formatters              │
 └───────────────▲──────────────────────────────────────────────────────────────┘
                 │ calls use cases            composition/container.ts wires ▼
 ┌───────────────┴──────────── application ──────────┐   ┌──── infrastructure ─────┐
 │ AnalyzeSecurity · GetLiveQuote · ManageTickerList │   │ YahooFinanceAdapter     │
 │ buildAnalyticsReport · ports: AnalyticsEngine     │◄──┤ CachedMarketData        │
 │ ProgressReporter · DTOs                           │   │ LocalStorageCache/List  │
 └───────────────▲───────────────────────────────────┘   │ Inline/Worker engines   │
                 │                                        │ fetchJson · SystemClock │
 ┌───────────────┴──────────── domain ───────────────┐   └────────────┬────────────┘
 │ entities: Ticker · Range · Quote · PriceSeries    │◄───────────────┘ implements
 │ services: Returns · Risk · Drawdown · Periods ·   │                  domain ports
 │           Distribution · ports: MarketData, Cache │
 └───────────────────────────────────────────────────┘
```

The dependency rule (`domain ← application ← infrastructure/ui`) is enforced by ESLint `no-restricted-imports` rules per layer. `src/lib/composition/container.ts` is the only place adapters are created.

Analytics run on the main thread for series shorter than 5,000 sessions. Longer series, such as `MAX` for long-listed stocks, run in a module Web Worker behind the same `AnalyticsEngine` port.

## How the browser reaches Yahoo Finance (CORS)

Yahoo Finance sends no CORS headers, so the browser calls a same-origin path, `/yf/v8/finance/chart/{symbol}`:

| Environment          | `/yf` is served by                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm dev` / preview | Vite `server.proxy`                                                                          |
| Docker               | Nginx reverse proxy: GET only, chart endpoint only, 60 s cache, rate-limited, no cookies     |
| Any static host      | Set `PUBLIC_CORS_PROXY` to a public proxy template such as `https://corsproxy.io/?url={url}` |

The Nginx proxy is static configuration, not an application runtime. Full history uses `period1=1900-01-01` with a daily interval, because Yahoo silently downsamples `range=max` to quarterly bars.

## Local development

```sh
pnpm install
pnpm dev            # http://localhost:5173
pnpm check          # svelte-check, strict TypeScript, zero warnings
pnpm lint           # Prettier + ESLint (including layer boundaries)
pnpm test           # Vitest
pnpm build          # static output in build/
```

## Docker

```sh
cp .env.example .env    # optional
docker compose up --build -d
open http://localhost:8080/AAPL
```

The multi-stage build runs `check`, `test` and `build` on Node 24 Alpine, then serves the output from `nginx:1.30-alpine`. The runtime container:

- runs as the non-root `nginx` user on port 8080;
- has a read-only root filesystem with a tmpfs for cache and temp files;
- drops all Linux capabilities;
- has health checks at `/healthz`.

Hashed assets are served precompressed with `Cache-Control: immutable`.

## Configuration

| Variable                | Default                 | Purpose                                                       |
| ----------------------- | ----------------------- | ------------------------------------------------------------- |
| `PUBLIC_SITE_URL`       | `http://localhost:8080` | Canonical, OpenGraph and sitemap origin                       |
| `PUBLIC_CORS_PROXY`     | _(empty)_               | Optional proxy template containing `{url}`; also added to CSP |
| `PUBLIC_RISK_FREE_RATE` | `0`                     | Annual risk-free rate (decimal) for Sharpe and Sortino        |
| `QUANTPULSE_PORT`       | `8080`                  | Host port published by Docker Compose                         |

The `PUBLIC_*` values are build-time settings: they are passed to Docker as build arguments.

## Methodology

All statistics use split- and dividend-adjusted daily closes with 252 trading days per year:

- **Volatility:** sample standard deviation × √252.
- **Sharpe and Sortino:** annualized arithmetic excess return divided by volatility or by downside deviation.
- **CAGR:** compounded over calendar days (365.25 per year).
- **VaR:** the historical quantile, with linear interpolation.
- **Expected shortfall:** the mean of returns at or below VaR.
- **Monthly returns:** compounded from the prior month-end close.
- **Contribution timing:** only complete months are used. A day's premium is its execution price ÷ the month's average close − 1. Orders scheduled for a non-trading or missing day (e.g. Feb 30) execute at the next session of the month, or at its last session.

## Disclaimer

Market data comes from Yahoo Finance and is subject to its terms of use. QuantPulse is for informational purposes only and is not investment advice.
