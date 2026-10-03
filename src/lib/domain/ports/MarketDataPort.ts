import type { PriceSeries } from '../entities/PriceSeries';
import type { Quote } from '../entities/Quote';
import type { Range } from '../entities/Range';
import type { Ticker } from '../entities/Ticker';

export interface MarketDataPort {
	fetchSeries(ticker: Ticker, range: Range, signal?: AbortSignal): Promise<PriceSeries>;
	fetchQuote(ticker: Ticker, signal?: AbortSignal): Promise<Quote>;
}
