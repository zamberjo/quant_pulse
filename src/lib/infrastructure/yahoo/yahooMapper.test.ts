import { describe, expect, it } from 'vitest';
import { parseTicker } from '$lib/domain/entities/Ticker';
import { MarketDataUnavailableError } from '$lib/domain/errors/DomainError';
import fixture from './__fixtures__/aapl-chart.json';
import { isYahooChartEnvelope, type YahooChartResult } from './YahooChartResponse';
import { toPriceSeries, toQuote } from './yahooMapper';

const ticker = parseTicker('AAPL');

function fixtureResult(): YahooChartResult {
	if (!isYahooChartEnvelope(fixture)) throw new Error('Fixture does not match the chart schema.');
	const result = fixture.chart.result?.[0];
	if (!result) throw new Error('Fixture has no result.');
	return result;
}

describe('isYahooChartEnvelope', () => {
	it('accepts real payloads and Yahoo error envelopes', () => {
		expect(isYahooChartEnvelope(fixture)).toBe(true);
		expect(
			isYahooChartEnvelope({
				chart: { result: null, error: { code: 'Not Found', description: 'No data found' } }
			})
		).toBe(true);
	});

	it('rejects malformed payloads', () => {
		expect(isYahooChartEnvelope(null)).toBe(false);
		expect(isYahooChartEnvelope({ chart: { result: [{ meta: {} }], error: null } })).toBe(false);
		expect(
			isYahooChartEnvelope({
				chart: {
					result: [{ meta: { symbol: 'X' }, indicators: { quote: [{ close: ['1'] }] } }],
					error: null
				}
			})
		).toBe(false);
	});
});

describe('yahooMapper', () => {
	it('maps the quote and derives the change from the previous close', () => {
		const quote = toQuote(fixtureResult(), ticker);
		expect(quote).toMatchObject({
			ticker: 'AAPL',
			name: 'Apple Inc.',
			exchange: 'NasdaqGS',
			currency: 'USD',
			timeZone: 'America/New_York',
			price: 333.69,
			previousClose: 341.07,
			marketTime: 1_790_971_201_000
		});
		expect(quote.change).toBeCloseTo(333.69 - 341.07, 10);
		expect(quote.changePercent).toBeCloseTo((333.69 - 341.07) / 341.07, 10);
	});

	it('rejects quotes without a price', () => {
		const result = fixtureResult();
		const broken: YahooChartResult = { ...result, meta: { symbol: 'AAPL', chartPreviousClose: 1 } };
		expect(() => toQuote(broken, ticker)).toThrow(MarketDataUnavailableError);
	});

	it('drops null closes, falls back to close for null adjusted closes and keeps the last duplicate', () => {
		const series = toPriceSeries(fixtureResult(), ticker);
		expect(series.utcOffsetSeconds).toBe(-14_400);
		expect(series.currency).toBe('USD');
		expect(series.bars.map((bar) => bar.time / 1000)).toEqual([
			1_790_602_200, 1_790_688_600, 1_790_861_400, 1_790_947_800
		]);
		expect(series.bars[1]?.volume).toBe(0);
		expect(series.bars[2]?.adjustedClose).toBe(series.bars[2]?.close);
		expect(series.bars[3]).toEqual({
			time: 1_790_947_800_000,
			close: 334.69000244140625,
			adjustedClose: 334.69000244140625,
			volume: 1000
		});
	});
});
