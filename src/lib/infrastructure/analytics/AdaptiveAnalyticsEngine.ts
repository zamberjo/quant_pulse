import type { AnalyticsReport, AnalyticsSettings } from '$lib/application/dto/AnalyticsReport';
import type { AnalyticsEngine } from '$lib/application/ports/AnalyticsEngine';
import type { PriceSeries } from '$lib/domain/entities/PriceSeries';

export class AdaptiveAnalyticsEngine implements AnalyticsEngine {
	#background: AnalyticsEngine | null = null;

	constructor(
		private readonly inline: AnalyticsEngine,
		private readonly createBackground: () => AnalyticsEngine | null,
		private readonly threshold: number
	) {}

	compute(
		series: PriceSeries,
		settings: AnalyticsSettings,
		signal?: AbortSignal
	): Promise<AnalyticsReport> {
		if (series.bars.length < this.threshold) return this.inline.compute(series, settings, signal);
		this.#background ??= this.createBackground();
		return (this.#background ?? this.inline).compute(series, settings, signal);
	}
}
