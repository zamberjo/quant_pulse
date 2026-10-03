import { InvalidTickerError } from '../errors/DomainError';

export type Ticker = string & { readonly __brand: 'Ticker' };

const TICKER_PATTERN = /^[A-Z0-9^][A-Z0-9.\-=^]{0,19}$/;

export function parseTicker(input: string): Ticker {
	const normalized = input.trim().toUpperCase();
	if (!TICKER_PATTERN.test(normalized)) throw new InvalidTickerError(input);
	return normalized as Ticker;
}

export function isValidTicker(input: string): boolean {
	return TICKER_PATTERN.test(input.trim().toUpperCase());
}
