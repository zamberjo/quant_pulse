import { describe, expect, it, vi } from 'vitest';
import type { PriceSeries } from '$lib/domain/entities/PriceSeries';
import type { Quote } from '$lib/domain/entities/Quote';
import { parseTicker } from '$lib/domain/entities/Ticker';
import type { CachePort } from '$lib/domain/ports/CachePort';
import type { MarketDataPort } from '$lib/domain/ports/MarketDataPort';
import { CachedMarketData } from './CachedMarketData';

const ticker = parseTicker('SPY');
const series: PriceSeries = { ticker, currency: 'USD', utcOffsetSeconds: 0, bars: [] };

class MemoryCache implements CachePort {
	readonly entries = new Map<string, unknown>();
	get<T>(key: string): T | null {
		return (this.entries.get(key) as T | undefined) ?? null;
	}
	set<T>(key: string, value: T): void {
		this.entries.set(key, value);
	}
}

function deferredSource() {
	let release: (value: PriceSeries) => void = () => undefined;
	const signals: AbortSignal[] = [];
	const source: MarketDataPort = {
		fetchQuote: vi.fn<MarketDataPort['fetchQuote']>(() => Promise.resolve({} as Quote)),
		fetchSeries: vi.fn<MarketDataPort['fetchSeries']>((_ticker, _range, signal) => {
			if (signal) signals.push(signal);
			return new Promise<PriceSeries>((resolve) => (release = resolve));
		})
	};
	return { source, signals, release: (value: PriceSeries) => release(value) };
}

describe('CachedMarketData', () => {
	it('deduplicates concurrent requests and caches the result', async () => {
		const { source, release } = deferredSource();
		const cache = new MemoryCache();
		const market = new CachedMarketData(source, cache, { quoteMs: 1, seriesMs: 1 });

		const first = market.fetchSeries(ticker, '1Y');
		const second = market.fetchSeries(ticker, '1Y');
		release(series);

		await expect(Promise.all([first, second])).resolves.toEqual([series, series]);
		expect(source.fetchSeries).toHaveBeenCalledTimes(1);
		await market.fetchSeries(ticker, '1Y');
		expect(source.fetchSeries).toHaveBeenCalledTimes(1);
		expect(cache.entries.has('series:SPY:1Y:1d')).toBe(true);
	});

	it('aborts the upstream request only when every consumer cancels', async () => {
		const { source, signals } = deferredSource();
		const market = new CachedMarketData(source, new MemoryCache(), { quoteMs: 1, seriesMs: 1 });
		const a = new AbortController();
		const b = new AbortController();

		const first = market.fetchSeries(ticker, '5Y', a.signal);
		const second = market.fetchSeries(ticker, '5Y', b.signal);
		a.abort();
		await expect(first).rejects.toBeInstanceOf(DOMException);
		expect(signals[0]?.aborted).toBe(false);

		b.abort();
		await expect(second).rejects.toBeInstanceOf(DOMException);
		expect(signals[0]?.aborted).toBe(true);
	});
});
