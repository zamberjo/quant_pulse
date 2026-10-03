import { buildAnalyticsReport } from '$lib/application/analytics/buildAnalyticsReport';
import { DomainError, InsufficientDataError } from '$lib/domain/errors/DomainError';
import type { AnalyticsRequest, AnalyticsResponse, SerializedError } from './workerProtocol';

function serialize(error: unknown): SerializedError {
	if (error instanceof InsufficientDataError) {
		return {
			code: error.code,
			message: error.message,
			required: error.required,
			available: error.available
		};
	}
	if (error instanceof DomainError) return { code: error.code, message: error.message };
	return { code: null, message: error instanceof Error ? error.message : String(error) };
}

addEventListener('message', (event: MessageEvent<AnalyticsRequest>) => {
	const { id, series, settings } = event.data;
	let response: AnalyticsResponse;
	try {
		response = { id, ok: true, report: buildAnalyticsReport(series, settings) };
	} catch (error) {
		response = { id, ok: false, error: serialize(error) };
	}
	postMessage(response);
});
