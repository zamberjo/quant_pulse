import { buildAnalyticsReport } from '$lib/application/analytics/buildAnalyticsReport';
import type { AnalyticsReport, AnalyticsSettings } from '$lib/application/dto/AnalyticsReport';
import type { AnalyticsEngine } from '$lib/application/ports/AnalyticsEngine';
import type { PriceSeries } from '$lib/domain/entities/PriceSeries';

export class InlineAnalyticsEngine implements AnalyticsEngine {
	async compute(
		series: PriceSeries,
		settings: AnalyticsSettings,
		signal?: AbortSignal
	): Promise<AnalyticsReport> {
		signal?.throwIfAborted();
		return buildAnalyticsReport(series, settings);
	}
}
