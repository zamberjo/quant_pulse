import type { PriceSeries } from '$lib/domain/entities/PriceSeries';
import type { AnalyticsReport, AnalyticsSettings } from '../dto/AnalyticsReport';

export interface AnalyticsEngine {
	compute(
		series: PriceSeries,
		settings: AnalyticsSettings,
		signal?: AbortSignal
	): Promise<AnalyticsReport>;
}
