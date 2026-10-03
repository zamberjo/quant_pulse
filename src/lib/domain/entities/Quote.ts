import type { Ticker } from './Ticker';

export interface Quote {
	readonly ticker: Ticker;
	readonly name: string;
	readonly exchange: string;
	readonly instrumentType: string;
	readonly currency: string;
	readonly timeZone: string;
	readonly price: number;
	readonly previousClose: number;
	readonly change: number;
	readonly changePercent: number;
	readonly marketTime: number;
	readonly dayHigh: number | null;
	readonly dayLow: number | null;
	readonly volume: number | null;
	readonly fiftyTwoWeekHigh: number | null;
	readonly fiftyTwoWeekLow: number | null;
}

export type QuoteFields = Omit<Quote, 'change' | 'changePercent'>;

export function createQuote(fields: QuoteFields): Quote {
	const change = fields.price - fields.previousClose;
	const changePercent = fields.previousClose === 0 ? 0 : change / fields.previousClose;
	return { ...fields, change, changePercent };
}
