import type { PriceSeries } from '$lib/domain/entities/PriceSeries';
import type { Quote } from '$lib/domain/entities/Quote';
import { rangeStart, type Range } from '$lib/domain/entities/Range';
import type { Ticker } from '$lib/domain/entities/Ticker';
import {
	MarketDataUnavailableError,
	RateLimitedError,
	TickerNotFoundError
} from '$lib/domain/errors/DomainError';
import type { ClockPort } from '$lib/domain/ports/ClockPort';
import type { MarketDataPort } from '$lib/domain/ports/MarketDataPort';
import { HttpError, type HttpClient, type HttpResponse } from '../http/httpClient';
import { isYahooChartEnvelope, type YahooChartResult } from './YahooChartResponse';
import type { YahooEndpointResolver } from './YahooEndpointResolver';
import { toPriceSeries, toQuote } from './yahooMapper';

/** 1900-01-01: requesting from this epoch returns the full daily history (range=max is downsampled). */
const FULL_HISTORY_START_SECONDS = -2_208_988_800;

export class YahooFinanceAdapter implements MarketDataPort {
	constructor(
		private readonly endpoints: YahooEndpointResolver,
		private readonly http: HttpClient,
		private readonly clock: ClockPort
	) {}

	async fetchQuote(ticker: Ticker, signal?: AbortSignal): Promise<Quote> {
		const result = await this.#chart(ticker, { range: '1d', interval: '1d' }, signal);
		return toQuote(result, ticker);
	}

	async fetchSeries(ticker: Ticker, range: Range, signal?: AbortSignal): Promise<PriceSeries> {
		const now = this.clock.now();
		const start = rangeStart(range, now);
		const result = await this.#chart(
			ticker,
			{
				period1: String(start === null ? FULL_HISTORY_START_SECONDS : Math.floor(start / 1000)),
				period2: String(Math.floor(now / 1000)),
				interval: '1d',
				includePrePost: 'false',
				events: 'div,split'
			},
			signal
		);
		return toPriceSeries(result, ticker);
	}

	async #chart(
		ticker: Ticker,
		params: Record<string, string>,
		signal: AbortSignal | undefined
	): Promise<YahooChartResult> {
		const url = this.endpoints.resolve(`/v8/finance/chart/${encodeURIComponent(ticker)}`, params);
		const response = await this.#request(url, signal);
		const { status, body } = response;

		if (status === 429) throw new RateLimitedError();
		if (!isYahooChartEnvelope(body)) {
			if (status === 404) throw new TickerNotFoundError(ticker);
			throw new MarketDataUnavailableError(status >= 500 ? 'proxy' : 'invalid-response');
		}
		const { result, error } = body.chart;
		if (error) {
			if (error.code === 'Not Found') throw new TickerNotFoundError(ticker);
			throw new MarketDataUnavailableError('upstream');
		}
		const first = result?.[0];
		if (!first) throw new TickerNotFoundError(ticker);
		return first;
	}

	async #request(url: string, signal: AbortSignal | undefined): Promise<HttpResponse> {
		try {
			return await this.http(url, { signal });
		} catch (error) {
			if (error instanceof HttpError) {
				const offline = globalThis.navigator?.onLine === false;
				throw new MarketDataUnavailableError(offline ? 'offline' : 'network');
			}
			throw error;
		}
	}
}
