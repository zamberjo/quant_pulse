import type { PriceSeries } from '$lib/domain/entities/PriceSeries';
import type { Quote } from '$lib/domain/entities/Quote';
import type { Range } from '$lib/domain/entities/Range';
import type { Ticker } from '$lib/domain/entities/Ticker';
import type { CachePort } from '$lib/domain/ports/CachePort';
import type { MarketDataPort } from '$lib/domain/ports/MarketDataPort';

export interface CacheTtl {
	readonly quoteMs: number;
	readonly seriesMs: number;
}

interface InFlight {
	readonly promise: Promise<unknown>;
	readonly controller: AbortController;
	consumers: number;
}

/**
 * Read-through cache decorator. Identical concurrent requests share one upstream call,
 * which is aborted only when every consumer has cancelled.
 */
export class CachedMarketData implements MarketDataPort {
	readonly #inFlight = new Map<string, InFlight>();

	constructor(
		private readonly source: MarketDataPort,
		private readonly cache: CachePort,
		private readonly ttl: CacheTtl
	) {}

	fetchQuote(ticker: Ticker, signal?: AbortSignal): Promise<Quote> {
		return this.#resolve(`quote:${ticker}`, this.ttl.quoteMs, signal, (shared) =>
			this.source.fetchQuote(ticker, shared)
		);
	}

	fetchSeries(ticker: Ticker, range: Range, signal?: AbortSignal): Promise<PriceSeries> {
		return this.#resolve(`series:${ticker}:${range}:1d`, this.ttl.seriesMs, signal, (shared) =>
			this.source.fetchSeries(ticker, range, shared)
		);
	}

	#resolve<T>(
		key: string,
		ttlMs: number,
		signal: AbortSignal | undefined,
		load: (signal: AbortSignal) => Promise<T>
	): Promise<T> {
		const cached = this.cache.get<T>(key);
		if (cached !== null) return Promise.resolve(cached);
		signal?.throwIfAborted();

		const entry = this.#inFlight.get(key) ?? this.#start(key, ttlMs, load);
		entry.consumers++;
		const shared = entry.promise as Promise<T>;
		if (!signal) return shared;

		return new Promise<T>((resolve, reject) => {
			const onAbort = () => {
				reject(signal.reason);
				if (--entry.consumers === 0 && this.#inFlight.get(key) === entry) {
					this.#inFlight.delete(key);
					entry.controller.abort(signal.reason);
				}
			};
			signal.addEventListener('abort', onAbort, { once: true });
			shared.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
		});
	}

	#start<T>(key: string, ttlMs: number, load: (signal: AbortSignal) => Promise<T>): InFlight {
		const controller = new AbortController();
		const promise = load(controller.signal)
			.then((value) => {
				this.cache.set(key, value, ttlMs);
				return value;
			})
			.finally(() => {
				if (this.#inFlight.get(key) === entry) this.#inFlight.delete(key);
			});
		promise.catch(() => undefined);
		const entry: InFlight = { promise, controller, consumers: 0 };
		this.#inFlight.set(key, entry);
		return entry;
	}
}
