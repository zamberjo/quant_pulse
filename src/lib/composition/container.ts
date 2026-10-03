import { AnalyzeSecurity } from '$lib/application/use-cases/AnalyzeSecurity';
import { GetLiveQuote } from '$lib/application/use-cases/GetLiveQuote';
import { ManageTickerList } from '$lib/application/use-cases/ManageTickerList';
import { AdaptiveAnalyticsEngine } from '$lib/infrastructure/analytics/AdaptiveAnalyticsEngine';
import { InlineAnalyticsEngine } from '$lib/infrastructure/analytics/InlineAnalyticsEngine';
import { WorkerAnalyticsEngine } from '$lib/infrastructure/analytics/WorkerAnalyticsEngine';
import { SystemClock } from '$lib/infrastructure/clock/SystemClock';
import { runtimeConfig } from '$lib/infrastructure/config/env';
import { fetchJson } from '$lib/infrastructure/http/httpClient';
import { CachedMarketData } from '$lib/infrastructure/market-data/CachedMarketData';
import { browserStorage } from '$lib/infrastructure/storage/browserStorage';
import { LocalStorageCache } from '$lib/infrastructure/storage/LocalStorageCache';
import { LocalStorageTickerList } from '$lib/infrastructure/storage/LocalStorageTickerList';
import { YahooEndpointResolver } from '$lib/infrastructure/yahoo/YahooEndpointResolver';
import { YahooFinanceAdapter } from '$lib/infrastructure/yahoo/YahooFinanceAdapter';

const TRADING_DAYS_PER_YEAR = 252;
const WORKER_THRESHOLD_BARS = 5_000;

export interface Container {
	readonly analyzeSecurity: AnalyzeSecurity;
	readonly getLiveQuote: GetLiveQuote;
	readonly watchlist: ManageTickerList;
	readonly recentTickers: ManageTickerList;
}

function createContainer(): Container {
	const clock = new SystemClock();
	const storage = browserStorage();
	const yahoo = new YahooFinanceAdapter(
		new YahooEndpointResolver(runtimeConfig.corsProxyTemplate),
		fetchJson,
		clock
	);
	const cachedMarketData = new CachedMarketData(yahoo, new LocalStorageCache(storage, clock), {
		quoteMs: 60_000,
		seriesMs: 15 * 60_000
	});
	const analytics = new AdaptiveAnalyticsEngine(
		new InlineAnalyticsEngine(),
		() => (typeof Worker === 'undefined' ? null : new WorkerAnalyticsEngine()),
		WORKER_THRESHOLD_BARS
	);

	return {
		analyzeSecurity: new AnalyzeSecurity(cachedMarketData, analytics, clock, {
			riskFreeRate: runtimeConfig.riskFreeRate,
			periodsPerYear: TRADING_DAYS_PER_YEAR
		}),
		getLiveQuote: new GetLiveQuote(yahoo),
		watchlist: new ManageTickerList(new LocalStorageTickerList(storage, 'qp:watchlist'), 50),
		recentTickers: new ManageTickerList(new LocalStorageTickerList(storage, 'qp:recent'), 8)
	};
}

let instance: Container | null = null;

export function container(): Container {
	instance ??= createContainer();
	return instance;
}
