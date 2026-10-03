import type { AnalyticsReport, AnalyticsSettings } from '$lib/application/dto/AnalyticsReport';
import type { AnalyticsEngine } from '$lib/application/ports/AnalyticsEngine';
import type { PriceSeries } from '$lib/domain/entities/PriceSeries';
import { InsufficientDataError } from '$lib/domain/errors/DomainError';
import type { AnalyticsRequest, AnalyticsResponse, SerializedError } from './workerProtocol';

interface Pending {
	readonly resolve: (report: AnalyticsReport) => void;
	readonly reject: (reason: unknown) => void;
}

function deserialize(error: SerializedError): Error {
	if (error.code === 'INSUFFICIENT_DATA') {
		return new InsufficientDataError(error.required ?? 0, error.available ?? 0);
	}
	return new Error(error.message);
}

export class WorkerAnalyticsEngine implements AnalyticsEngine {
	#worker: Worker | null = null;
	#nextId = 0;
	readonly #pending = new Map<number, Pending>();

	compute(
		series: PriceSeries,
		settings: AnalyticsSettings,
		signal?: AbortSignal
	): Promise<AnalyticsReport> {
		signal?.throwIfAborted();
		const worker = this.#ensureWorker();
		const id = this.#nextId++;
		return new Promise<AnalyticsReport>((resolve, reject) => {
			const onAbort = () => {
				this.#pending.delete(id);
				reject(signal?.reason);
			};
			signal?.addEventListener('abort', onAbort, { once: true });
			this.#pending.set(id, {
				resolve: (report) => {
					signal?.removeEventListener('abort', onAbort);
					resolve(report);
				},
				reject: (reason) => {
					signal?.removeEventListener('abort', onAbort);
					reject(reason);
				}
			});
			worker.postMessage({ id, series, settings } satisfies AnalyticsRequest);
		});
	}

	#ensureWorker(): Worker {
		if (this.#worker) return this.#worker;
		const worker = new Worker(new URL('./analytics.worker.ts', import.meta.url), {
			type: 'module',
			name: 'quantpulse-analytics'
		});
		worker.addEventListener('message', (event: MessageEvent<AnalyticsResponse>) => {
			const response = event.data;
			const pending = this.#pending.get(response.id);
			if (!pending) return;
			this.#pending.delete(response.id);
			if (response.ok) pending.resolve(response.report);
			else pending.reject(deserialize(response.error));
		});
		worker.addEventListener('error', (event) => {
			const failure = new Error(event.message || 'Analytics worker failed.');
			for (const pending of this.#pending.values()) pending.reject(failure);
			this.#pending.clear();
			worker.terminate();
			this.#worker = null;
		});
		this.#worker = worker;
		return worker;
	}
}
