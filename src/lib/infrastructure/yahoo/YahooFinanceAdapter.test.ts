import { describe, expect, it, vi } from 'vitest';
import { parseTicker } from '$lib/domain/entities/Ticker';
import {
	MarketDataUnavailableError,
	RateLimitedError,
	TickerNotFoundError
} from '$lib/domain/errors/DomainError';
import { HttpError, type HttpClient } from '../http/httpClient';
import fixture from './__fixtures__/aapl-chart.json';
import { YahooEndpointResolver } from './YahooEndpointResolver';
import { YahooFinanceAdapter } from './YahooFinanceAdapter';

const NOW = Date.UTC(2026, 9, 2, 20, 0);
const clock = { now: () => NOW };
const ticker = parseTicker('AAPL');

function adapter(http: HttpClient, proxy: string | null = null): YahooFinanceAdapter {
	return new YahooFinanceAdapter(new YahooEndpointResolver(proxy), http, clock);
}

describe('YahooFinanceAdapter', () => {
	it('requests daily bars for the range through the same-origin proxy', async () => {
		const http = vi.fn<HttpClient>().mockResolvedValue({ status: 200, body: fixture });
		const series = await adapter(http).fetchSeries(ticker, '1Y');
		const url = new URL(http.mock.calls[0]?.[0] ?? '', 'http://localhost');
		expect(url.pathname).toBe('/yf/v8/finance/chart/AAPL');
		expect(url.searchParams.get('interval')).toBe('1d');
		expect(url.searchParams.get('period1')).toBe(String(Date.UTC(2025, 9, 2, 20, 0) / 1000));
		expect(url.searchParams.get('period2')).toBe(String(NOW / 1000));
		expect(series.bars).toHaveLength(4);
	});

	it('requests the full daily history for MAX', async () => {
		const http = vi.fn<HttpClient>().mockResolvedValue({ status: 200, body: fixture });
		await adapter(http).fetchSeries(ticker, 'MAX');
		const url = new URL(http.mock.calls[0]?.[0] ?? '', 'http://localhost');
		expect(url.searchParams.get('period1')).toBe('-2208988800');
	});

	it('encodes the upstream URL into a configured CORS proxy template', async () => {
		const http = vi.fn<HttpClient>().mockResolvedValue({ status: 200, body: fixture });
		await adapter(http, 'https://proxy.example/?url={url}').fetchQuote(ticker);
		const requested = http.mock.calls[0]?.[0] ?? '';
		expect(
			requested.startsWith(
				'https://proxy.example/?url=https%3A%2F%2Fquery1.finance.yahoo.com%2Fv8%2Ffinance%2Fchart%2FAAPL'
			)
		).toBe(true);
	});

	it.each([
		[
			{
				status: 404,
				body: { chart: { result: null, error: { code: 'Not Found', description: 'x' } } }
			},
			TickerNotFoundError
		],
		[{ status: 429, body: null }, RateLimitedError],
		[{ status: 502, body: null }, MarketDataUnavailableError],
		[{ status: 200, body: { unexpected: true } }, MarketDataUnavailableError]
	])('maps provider failures to domain errors', async (response, expected) => {
		const http = vi.fn<HttpClient>().mockResolvedValue(response);
		await expect(adapter(http).fetchQuote(ticker)).rejects.toBeInstanceOf(expected);
	});

	it('maps transport failures to unavailability', async () => {
		const http = vi.fn<HttpClient>().mockRejectedValue(new HttpError('network'));
		await expect(adapter(http).fetchQuote(ticker)).rejects.toMatchObject({ reason: 'network' });
	});
});
