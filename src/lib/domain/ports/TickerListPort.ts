import type { Ticker } from '../entities/Ticker';

export interface TickerListPort {
	load(): Ticker[];
	save(tickers: readonly Ticker[]): void;
}
