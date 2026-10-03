import { tick } from 'svelte';
import type { SecurityAnalysis } from '$lib/application/dto/SecurityAnalysis';
import type { AnalyzeSecurity } from '$lib/application/use-cases/AnalyzeSecurity';
import type { GetLiveQuote } from '$lib/application/use-cases/GetLiveQuote';
import type { Quote } from '$lib/domain/entities/Quote';
import type { Range } from '$lib/domain/entities/Range';
import type { Ticker } from '$lib/domain/entities/Ticker';
import { loadingProgress } from './progress.svelte';

export type AnalysisStatus = 'idle' | 'loading' | 'ready' | 'error';

const LIVE_REFRESH_MS = 30_000;

function isAbort(error: unknown): boolean {
	return error instanceof DOMException && error.name === 'AbortError';
}

export class AnalysisController {
	status = $state<AnalysisStatus>('idle');
	analysis = $state.raw<SecurityAnalysis | null>(null);
	liveQuote = $state.raw<Quote | null>(null);
	error = $state.raw<unknown>(null);

	readonly quote = $derived(this.liveQuote ?? this.analysis?.quote ?? null);

	#request: { ticker: string; range: Range } | null = null;
	#loadController: AbortController | null = null;
	#liveController: AbortController | null = null;
	#timer: ReturnType<typeof setInterval> | null = null;
	#lastRefresh = 0;

	constructor(
		private readonly analyzeSecurity: AnalyzeSecurity,
		private readonly getLiveQuote: GetLiveQuote,
		private readonly onAnalyzed: (ticker: Ticker) => void
	) {}

	async load(ticker: string, range: Range): Promise<void> {
		this.#request = { ticker, range };
		this.#stopLiveUpdates();
		this.#loadController?.abort();
		const controller = new AbortController();
		this.#loadController = controller;

		this.status = 'loading';
		this.error = null;
		this.liveQuote = null;

		try {
			const analysis = await this.analyzeSecurity.execute(
				{ ticker, range },
				{ signal: controller.signal, progress: loadingProgress }
			);
			if (controller.signal.aborted) return;
			loadingProgress.report('rendering');
			this.analysis = analysis;
			this.status = 'ready';
			this.#lastRefresh = Date.now();
			await tick();
			this.onAnalyzed(analysis.ticker);
			this.#startLiveUpdates(analysis.ticker);
		} catch (error) {
			if (isAbort(error) || controller.signal.aborted) return;
			this.analysis = null;
			this.error = error;
			this.status = 'error';
		} finally {
			if (this.#loadController === controller) {
				loadingProgress.finish(this.status === 'error');
				this.#loadController = null;
			}
		}
	}

	retry(): void {
		if (this.#request) void this.load(this.#request.ticker, this.#request.range);
	}

	dispose(): void {
		this.#loadController?.abort();
		this.#stopLiveUpdates();
		loadingProgress.reset();
	}

	#startLiveUpdates(ticker: Ticker): void {
		const refreshIfVisible = () => {
			if (document.visibilityState !== 'visible') return;
			if (Date.now() - this.#lastRefresh < LIVE_REFRESH_MS - 1_000) return;
			void this.#refresh(ticker);
		};
		this.#timer = setInterval(refreshIfVisible, LIVE_REFRESH_MS);
		document.addEventListener('visibilitychange', refreshIfVisible);
		this.#liveController = new AbortController();
		this.#liveController.signal.addEventListener('abort', () =>
			document.removeEventListener('visibilitychange', refreshIfVisible)
		);
	}

	async #refresh(ticker: Ticker): Promise<void> {
		const signal = this.#liveController?.signal;
		if (!signal) return;
		this.#lastRefresh = Date.now();
		try {
			const quote = await this.getLiveQuote.execute(ticker, signal);
			if (!signal.aborted) this.liveQuote = quote;
		} catch {
			return;
		}
	}

	#stopLiveUpdates(): void {
		if (this.#timer !== null) clearInterval(this.#timer);
		this.#timer = null;
		this.#liveController?.abort();
		this.#liveController = null;
	}
}
