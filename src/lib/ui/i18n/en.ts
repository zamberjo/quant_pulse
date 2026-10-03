export const en = {
	meta: {
		homeTitle: 'QuantPulse — Institutional-Grade Security Analytics',
		tickerTitle: (ticker: string, name?: string) =>
			name ? `${ticker} · ${name} · QuantPulse` : `${ticker} · QuantPulse`
	},
	layout: {
		skipToContent: 'Skip to content',
		home: 'QuantPulse home',
		footerLocal: 'QuantPulse · Analytics computed locally in your browser.',
		footerData:
			'Market data from Yahoo Finance. For informational purposes only; not investment advice.',
		language: 'Language',
		darkTheme: 'Dark theme',
		lookbackRange: 'Lookback range'
	},
	search: {
		label: 'Ticker symbol',
		placeholder: 'Ticker — AAPL, SPY, VWCE.DE',
		invalid: 'Enter a valid ticker symbol.'
	},
	watchlist: {
		title: 'Watchlist',
		recent: 'Recent',
		emptyWatchlist: 'Star a security to pin it here.',
		emptyRecent: 'Analyzed tickers appear here.',
		remove: (ticker: string) => `Remove ${ticker} from watchlist`,
		toggle: (ticker: string) => `Watchlist ${ticker}`,
		open: 'Open watchlist',
		close: 'Close watchlist',
		sheetTitle: 'Securities'
	},
	home: {
		eyebrow: 'Security analytics',
		title: 'Institutional-grade risk and return analytics for any stock or ETF.',
		intro:
			'Enter a ticker above to analyze its performance, risk profile and return distribution, or start with one of the securities below.',
		featured: 'Featured securities',
		why: 'Why QuantPulse',
		pillars: [
			{
				title: 'Institutional metrics',
				body: 'CAGR, volatility, Sharpe, Sortino, Calmar, drawdowns, VaR, expected shortfall and higher moments.'
			},
			{
				title: 'Computed on your device',
				body: 'Prices are fetched directly and every statistic is calculated locally, with no server in between.'
			},
			{
				title: 'Private by design',
				body: 'No accounts and no tracking. Your watchlist lives only in this browser.'
			}
		]
	},
	quote: {
		asOf: 'As of',
		volume: 'Volume',
		fiftyTwoWeekRange: '52-week range',
		rangePosition: (percent: number) => `Price is at ${percent}% of its 52-week range`
	},
	dashboard: {
		loading: 'Loading analysis',
		loadingSection: (label: string) => `Loading ${label}`,
		charts: 'charts',
		statistics: 'statistics',
		analysisPeriod: 'Analysis period',
		sessions: 'sessions',
		adjustedCloses: 'adjusted closes'
	},
	progress: {
		label: 'Analysis progress',
		failed: 'Failed',
		stages: {
			resolving: 'Resolving ticker',
			quote: 'Fetching quote',
			history: 'Fetching history',
			computing: 'Computing statistics',
			rendering: 'Rendering'
		}
	},
	metrics: {
		heading: 'Key metrics',
		howCalculated: (label: string) => `How ${label} is calculated`,
		cagr: {
			label: 'CAGR',
			caption: 'Compound annual growth rate over the selected range.',
			formula:
				'(Ending price ÷ starting price)^(365.25 ÷ calendar days) − 1, using split- and dividend-adjusted closes.'
		},
		volatility: {
			label: 'Volatility',
			caption: 'Annualized standard deviation of daily returns.',
			formula: 'Sample standard deviation of daily simple returns × √252.'
		},
		sharpe: {
			label: 'Sharpe',
			caption: (rf: string) => `Excess return per unit of total risk (rf ${rf}).`,
			formula: '(Mean daily return − rf ÷ 252) × 252 ÷ annualized volatility.'
		},
		sortino: {
			label: 'Sortino',
			caption: (rf: string) => `Excess return per unit of downside risk (rf ${rf}).`,
			formula: '(Mean daily return − rf ÷ 252) × 252 ÷ annualized downside deviation below rf.'
		},
		maxDrawdown: {
			label: 'Max drawdown',
			caption: (peak: string, trough: string, recovered: boolean) =>
				`${peak} → ${trough}, ${recovered ? 'recovered' : 'not recovered'}.`,
			none: 'No decline from a prior peak in this range.',
			formula: 'Largest peak-to-trough decline of the adjusted close: min(Pₜ ÷ max(P₀…Pₜ) − 1).'
		},
		currentDrawdown: {
			label: 'Current drawdown',
			caption: 'Distance of the latest close from its running peak.',
			formula: 'Latest adjusted close ÷ highest adjusted close in range − 1.'
		},
		valueAtRisk: {
			label: 'VaR 95%',
			caption: 'One-day loss threshold exceeded on 5% of sessions.',
			formula: '5th percentile of historical daily returns (linear interpolation).'
		},
		positiveDays: {
			label: 'Positive days',
			caption: 'Share of sessions that closed higher than the prior session.',
			formula: 'Count of daily returns > 0 ÷ total daily returns.'
		}
	},
	charts: {
		period: 'Period',
		value: 'Value',
		daily: {
			title: 'Daily returns',
			subtitle: (count: number) => `Last ${count} sessions`,
			description: (count: number) =>
				`Bar chart of daily simple returns for the most recent ${count} sessions. Bars above the zero line are gains, below are losses.`
		},
		monthly: {
			title: 'Monthly returns',
			subtitle: (count: number) => `Last ${count} months, compounded`,
			description: (count: number) =>
				`Bar chart of compounded calendar-month returns for the most recent ${count} months.`
		},
		weekday: {
			title: 'Weekday seasonality',
			chartTitle: 'Average return by weekday',
			subtitle: 'Mean daily return',
			description:
				'Bar chart of the mean daily return grouped by weekday across the selected range.',
			sessions: (count: number) => `${count} sessions`
		}
	},
	statistics: {
		heading: 'Statistics',
		calendarHeading: 'Monthly returns calendar',
		calendarCaption: 'Monthly returns by calendar year with compounded yearly totals',
		year: 'Year',
		groups: { returns: 'Returns', risk: 'Risk', distribution: 'Distribution' },
		trailing: {
			'1M': '1-month return',
			'3M': '3-month return',
			'6M': '6-month return',
			YTD: 'Year-to-date return',
			'1Y': '1-year return',
			'3Y': '3-year return',
			'5Y': '5-year return'
		},
		rows: {
			cumulative: 'Cumulative return',
			cagr: 'CAGR',
			annualized: 'Annualized',
			sessions: 'Sessions',
			volatility: 'Annualized volatility',
			downsideDeviation: 'Downside deviation',
			sharpe: 'Sharpe ratio',
			sortino: 'Sortino ratio',
			calmar: 'Calmar ratio',
			maxDrawdown: 'Maximum drawdown',
			drawdownPeak: 'Drawdown peak',
			drawdownTrough: 'Drawdown trough',
			recovery: 'Recovery',
			notRecovered: 'Not recovered',
			drawdownDuration: 'Drawdown duration',
			days: (count: string) => `${count} days`,
			currentDrawdown: 'Current drawdown',
			valueAtRisk95: 'Value at Risk (95%, 1-day)',
			valueAtRisk99: 'Value at Risk (99%, 1-day)',
			historical: 'Historical',
			expectedShortfall: 'Expected shortfall (95%)',
			cvar: 'CVaR',
			meanDaily: 'Mean daily return',
			medianDaily: 'Median daily return',
			dailyStandardDeviation: 'Daily standard deviation',
			meanLog: 'Mean daily log return',
			skewness: 'Skewness',
			kurtosis: 'Excess kurtosis',
			positiveSessions: 'Positive sessions',
			bestSession: 'Best session',
			worstSession: 'Worst session',
			bestMonth: 'Best month',
			worstMonth: 'Worst month'
		}
	},
	contribution: {
		heading: 'Contribution timing',
		intro: (months: number, from: number, to: number) =>
			`Which day of the month has historically been the cheapest to invest, based on ${months} complete months (${from}–${to}).`,
		methodology:
			'Each day is compared with the average close of its month. Contributions on non-trading days execute at the next session of the same month, or at its last session. Negative values are cheaper than the month average.',
		empty:
			'There are no complete months in this range. Choose 3Y, 5Y, 10Y or MAX to compare contribution days.',
		lowSample: (months: number) =>
			`Only ${months} months analyzed. Choose a longer range for more reliable results.`,
		day: (day: number) => `Day ${day}`,
		bestDay: 'Cheapest day',
		worstDay: 'Most expensive day',
		spread: 'Best vs worst',
		dayCaption: (premium: string, share: string) =>
			`${premium} vs month average · cheapest of its month ${share} of the time.`,
		spreadCaption: 'Average price gap between the cheapest and the most expensive day.',
		dayFormula:
			'Mean over complete months of (execution price on that day ÷ average close of the month − 1).',
		spreadFormula: 'Mean premium of the most expensive day − mean premium of the cheapest day.',
		chartTitle: 'Price vs month average by day of the month',
		chartDescription:
			'Bar chart of the average premium of each day of the month over the month average close. Lower bars mark cheaper days.',
		chartTooltip: (day: number, months: number) => `Day ${day} · ${months} months`,
		unit: '% vs month average',
		matrixHeading: 'By month of the year',
		matrixCaption:
			'Average premium of each day versus its month average, per calendar month across years',
		month: 'Month',
		best: 'Best',
		historyHeading: 'Year by year',
		historyMonth: 'Month to compare',
		historyCaption: (month: string) =>
			`Premium of each day of ${month} versus that month average, by year`,
		year: 'Year',
		average: 'Average',
		cheapestMarked: 'The cheapest day of each row is outlined.'
	},
	errors: {
		retry: 'Retry',
		unavailable: {
			offline: { title: 'You are offline', detail: 'Reconnect to the internet and retry.' },
			network: {
				title: 'Network error',
				detail: 'The market data service could not be reached. Check your connection.'
			},
			proxy: {
				title: 'Data proxy unavailable',
				detail:
					'The market data proxy did not respond. If you run QuantPulse locally, use the Vite dev server or the Docker image.'
			},
			upstream: {
				title: 'Provider error',
				detail: 'Yahoo Finance returned an error for this request.'
			},
			'invalid-response': {
				title: 'Unexpected response',
				detail: 'The market data provider returned data in an unexpected format.'
			}
		},
		invalidTicker: {
			title: 'Invalid ticker',
			detail: (ticker: string) =>
				`“${ticker}” is not a valid symbol. Use formats like AAPL, VWCE.DE, ^GSPC or BTC-USD.`
		},
		notFound: {
			title: 'Ticker not found',
			detail: (ticker: string) =>
				`No market data exists for “${ticker}”. Check the symbol and exchange suffix.`
		},
		insufficientData: {
			title: 'Not enough history',
			detail: 'This security has too few sessions in the selected range. Choose a longer range.'
		},
		rateLimited: {
			title: 'Rate limited',
			detail: 'The data provider is throttling requests. Wait a few seconds and retry.'
		},
		generic: { title: 'Something went wrong', detail: 'An unexpected error occurred.' }
	}
};

export type Messages = typeof en;
