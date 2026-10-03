type NullableSeries = readonly (number | null)[];

export interface YahooChartMeta {
	readonly symbol: string;
	readonly currency?: string;
	readonly exchangeName?: string;
	readonly fullExchangeName?: string;
	readonly instrumentType?: string;
	readonly exchangeTimezoneName?: string;
	readonly gmtoffset?: number;
	readonly regularMarketPrice?: number;
	readonly regularMarketTime?: number;
	readonly regularMarketDayHigh?: number;
	readonly regularMarketDayLow?: number;
	readonly regularMarketVolume?: number;
	readonly chartPreviousClose?: number;
	readonly previousClose?: number;
	readonly fiftyTwoWeekHigh?: number;
	readonly fiftyTwoWeekLow?: number;
	readonly longName?: string;
	readonly shortName?: string;
}

export interface YahooChartResult {
	readonly meta: YahooChartMeta;
	readonly timestamp?: readonly number[];
	readonly indicators: {
		readonly quote: readonly {
			readonly close?: NullableSeries;
			readonly volume?: NullableSeries;
		}[];
		readonly adjclose?: readonly { readonly adjclose?: NullableSeries }[];
	};
}

export interface YahooChartError {
	readonly code: string;
	readonly description: string;
}

export interface YahooChartEnvelope {
	readonly chart: {
		readonly result: readonly YahooChartResult[] | null;
		readonly error: YahooChartError | null;
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isNullableSeries(value: unknown): value is NullableSeries {
	return (
		Array.isArray(value) && value.every((entry) => entry === null || typeof entry === 'number')
	);
}

function isOptionalSeries(value: unknown): boolean {
	return value === undefined || isNullableSeries(value);
}

function isChartResult(value: unknown): value is YahooChartResult {
	if (!isRecord(value) || !isRecord(value.meta) || typeof value.meta.symbol !== 'string') {
		return false;
	}
	const { timestamp, indicators } = value;
	if (timestamp !== undefined && !(Array.isArray(timestamp) && timestamp.every(Number.isFinite))) {
		return false;
	}
	if (!isRecord(indicators) || !Array.isArray(indicators.quote)) return false;
	const quotesValid = indicators.quote.every(
		(quote: unknown) =>
			isRecord(quote) && isOptionalSeries(quote.close) && isOptionalSeries(quote.volume)
	);
	const adjusted = indicators.adjclose;
	const adjustedValid =
		adjusted === undefined ||
		(Array.isArray(adjusted) &&
			adjusted.every((entry: unknown) => isRecord(entry) && isOptionalSeries(entry.adjclose)));
	return quotesValid && adjustedValid;
}

function isChartError(value: unknown): value is YahooChartError {
	return isRecord(value) && typeof value.code === 'string' && typeof value.description === 'string';
}

export function isYahooChartEnvelope(value: unknown): value is YahooChartEnvelope {
	if (!isRecord(value) || !isRecord(value.chart)) return false;
	const { result, error } = value.chart;
	const resultValid = result === null || (Array.isArray(result) && result.every(isChartResult));
	const errorValid = error === null || error === undefined || isChartError(error);
	return resultValid && errorValid;
}
