import type { Quote } from '$lib/domain/entities/Quote';
import type { Range } from '$lib/domain/entities/Range';
import type { Ticker } from '$lib/domain/entities/Ticker';
import type { AnalyticsReport, AnalyticsSettings } from './AnalyticsReport';

export interface SecurityAnalysis {
	readonly ticker: Ticker;
	readonly range: Range;
	readonly currency: string;
	readonly quote: Quote;
	readonly report: AnalyticsReport;
	readonly settings: AnalyticsSettings;
	readonly generatedAt: number;
}
