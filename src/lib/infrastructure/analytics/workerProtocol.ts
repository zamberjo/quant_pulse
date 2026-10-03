import type { AnalyticsReport, AnalyticsSettings } from '$lib/application/dto/AnalyticsReport';
import type { PriceSeries } from '$lib/domain/entities/PriceSeries';
import type { DomainErrorCode } from '$lib/domain/errors/DomainError';

export interface AnalyticsRequest {
	readonly id: number;
	readonly series: PriceSeries;
	readonly settings: AnalyticsSettings;
}

export interface SerializedError {
	readonly code: DomainErrorCode | null;
	readonly message: string;
	readonly required?: number;
	readonly available?: number;
}

export type AnalyticsResponse =
	| { readonly id: number; readonly ok: true; readonly report: AnalyticsReport }
	| { readonly id: number; readonly ok: false; readonly error: SerializedError };
