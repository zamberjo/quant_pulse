import { describe, expect, it } from 'vitest';
import { parseRange, rangeStart, subtractMonths } from './Range';
import { parseTicker } from './Ticker';
import { InvalidTickerError } from '../errors/DomainError';

describe('Range', () => {
	const now = Date.UTC(2024, 2, 31, 15, 0);

	it('clamps month arithmetic to the end of shorter months', () => {
		expect(new Date(subtractMonths(now, 1)).toISOString()).toBe('2024-02-29T15:00:00.000Z');
	});

	it('resolves range starts', () => {
		expect(rangeStart('MAX', now)).toBeNull();
		expect(new Date(rangeStart('YTD', now) ?? 0).toISOString()).toBe('2024-01-01T00:00:00.000Z');
		expect(new Date(rangeStart('3Y', now) ?? 0).toISOString()).toBe('2021-03-31T15:00:00.000Z');
	});

	it('parses ranges case-insensitively with a default', () => {
		expect(parseRange('5y')).toBe('5Y');
		expect(parseRange('bogus')).toBe('1Y');
		expect(parseRange(null)).toBe('1Y');
	});
});

describe('Ticker', () => {
	it('normalizes valid symbols', () => {
		expect(parseTicker(' vwce.de ')).toBe('VWCE.DE');
		expect(parseTicker('^gspc')).toBe('^GSPC');
		expect(parseTicker('eurusd=x')).toBe('EURUSD=X');
	});

	it('rejects invalid symbols', () => {
		expect(() => parseTicker('')).toThrow(InvalidTickerError);
		expect(() => parseTicker('AAPL; DROP')).toThrow(InvalidTickerError);
	});
});
