import type { Quote } from '$lib/domain/entities/Quote';
import type { Ticker } from '$lib/domain/entities/Ticker';
import type { MarketDataPort } from '$lib/domain/ports/MarketDataPort';

export class GetLiveQuote {
	constructor(private readonly marketData: MarketDataPort) {}

	execute(ticker: Ticker, signal?: AbortSignal): Promise<Quote> {
		return this.marketData.fetchQuote(ticker, signal);
	}
}
