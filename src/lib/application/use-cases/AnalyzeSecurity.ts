import type { Range } from '$lib/domain/entities/Range';
import { parseTicker } from '$lib/domain/entities/Ticker';
import type { ClockPort } from '$lib/domain/ports/ClockPort';
import type { MarketDataPort } from '$lib/domain/ports/MarketDataPort';
import type { AnalyticsSettings } from '../dto/AnalyticsReport';
import type { SecurityAnalysis } from '../dto/SecurityAnalysis';
import type { AnalyticsEngine } from '../ports/AnalyticsEngine';
import type { ProgressReporter } from '../progress/ProgressReporter';

export interface AnalyzeSecurityInput {
	readonly ticker: string;
	readonly range: Range;
}

export interface ExecutionContext {
	readonly signal?: AbortSignal | undefined;
	readonly progress?: ProgressReporter | undefined;
}

export class AnalyzeSecurity {
	constructor(
		private readonly marketData: MarketDataPort,
		private readonly analytics: AnalyticsEngine,
		private readonly clock: ClockPort,
		private readonly settings: AnalyticsSettings
	) {}

	async execute(
		input: AnalyzeSecurityInput,
		{ signal, progress }: ExecutionContext = {}
	): Promise<SecurityAnalysis> {
		progress?.report('resolving');
		const ticker = parseTicker(input.ticker);

		progress?.report('quote');
		const seriesRequest = this.marketData.fetchSeries(ticker, input.range, signal);
		seriesRequest.catch(() => undefined);
		const quote = await this.marketData.fetchQuote(ticker, signal);

		progress?.report('history');
		const series = await seriesRequest;

		progress?.report('computing');
		const report = await this.analytics.compute(series, this.settings, signal);
		signal?.throwIfAborted();

		return {
			ticker,
			range: input.range,
			currency: series.currency,
			quote,
			report,
			settings: this.settings,
			generatedAt: this.clock.now()
		};
	}
}
