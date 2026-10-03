import type { PriceBar } from '$lib/domain/entities/PriceBar';
import type { PriceSeries } from '$lib/domain/entities/PriceSeries';
import { createQuote, type Quote } from '$lib/domain/entities/Quote';
import type { Ticker } from '$lib/domain/entities/Ticker';
import { MarketDataUnavailableError } from '$lib/domain/errors/DomainError';
import type { YahooChartResult } from './YahooChartResponse';

function finite(value: number | null | undefined): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function toQuote(result: YahooChartResult, ticker: Ticker): Quote {
	const { meta } = result;
	const price = finite(meta.regularMarketPrice);
	const previousClose = finite(meta.chartPreviousClose) ?? finite(meta.previousClose);
	if (price === null || previousClose === null) {
		throw new MarketDataUnavailableError('invalid-response');
	}
	return createQuote({
		ticker,
		name: meta.longName ?? meta.shortName ?? ticker,
		exchange: meta.fullExchangeName ?? meta.exchangeName ?? '',
		instrumentType: meta.instrumentType ?? '',
		currency: meta.currency ?? '',
		timeZone: meta.exchangeTimezoneName ?? 'UTC',
		price,
		previousClose,
		marketTime: (finite(meta.regularMarketTime) ?? 0) * 1000,
		dayHigh: finite(meta.regularMarketDayHigh),
		dayLow: finite(meta.regularMarketDayLow),
		volume: finite(meta.regularMarketVolume),
		fiftyTwoWeekHigh: finite(meta.fiftyTwoWeekHigh),
		fiftyTwoWeekLow: finite(meta.fiftyTwoWeekLow)
	});
}

export function toPriceSeries(result: YahooChartResult, ticker: Ticker): PriceSeries {
	const timestamps = result.timestamp ?? [];
	const quote = result.indicators.quote[0];
	const closes = quote?.close ?? [];
	const volumes = quote?.volume ?? [];
	const adjusted = result.indicators.adjclose?.[0]?.adjclose ?? [];

	const bars = new Map<number, PriceBar>();
	timestamps.forEach((seconds, index) => {
		const close = finite(closes[index]);
		if (close === null || close <= 0) return;
		const adjustedClose = finite(adjusted[index]);
		bars.set(seconds, {
			time: seconds * 1000,
			close,
			adjustedClose: adjustedClose !== null && adjustedClose > 0 ? adjustedClose : close,
			volume: finite(volumes[index]) ?? 0
		});
	});

	return {
		ticker,
		currency: result.meta.currency ?? '',
		utcOffsetSeconds: finite(result.meta.gmtoffset) ?? 0,
		bars: [...bars.values()].sort((a, b) => a.time - b.time)
	};
}
