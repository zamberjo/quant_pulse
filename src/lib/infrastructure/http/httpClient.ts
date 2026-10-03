export interface HttpResponse {
	readonly status: number;
	readonly body: unknown;
}

export interface HttpRequestOptions {
	readonly signal?: AbortSignal | undefined;
	readonly timeoutMs?: number;
	readonly retries?: number;
}

export type HttpFailure = 'network' | 'timeout';

export class HttpError extends Error {
	override readonly name = 'HttpError';

	constructor(readonly failure: HttpFailure) {
		super(`HTTP request failed: ${failure}.`);
	}
}

export type HttpClient = (url: string, options?: HttpRequestOptions) => Promise<HttpResponse>;

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const BASE_BACKOFF_MS = 400;

function sleep(ms: number, signal: AbortSignal | undefined): Promise<void> {
	return new Promise((resolve, reject) => {
		signal?.throwIfAborted();
		const timer = setTimeout(() => {
			signal?.removeEventListener('abort', onAbort);
			resolve();
		}, ms);
		const onAbort = () => {
			clearTimeout(timer);
			reject(signal?.reason);
		};
		signal?.addEventListener('abort', onAbort, { once: true });
	});
}

function backoff(attempt: number): number {
	const ceiling = BASE_BACKOFF_MS * 2 ** attempt;
	return ceiling / 2 + Math.random() * (ceiling / 2);
}

async function parseBody(response: Response): Promise<unknown> {
	try {
		return await response.json();
	} catch {
		return null;
	}
}

export const fetchJson: HttpClient = async (
	url,
	{ signal, timeoutMs = 12_000, retries = 2 } = {}
) => {
	for (let attempt = 0; ; attempt++) {
		const timeout = AbortSignal.timeout(timeoutMs);
		const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
		const hasRetry = attempt < retries;
		try {
			const response = await fetch(url, {
				signal: combined,
				headers: { Accept: 'application/json' },
				credentials: 'omit'
			});
			if (RETRYABLE_STATUS.has(response.status) && hasRetry) {
				await sleep(backoff(attempt), signal);
				continue;
			}
			return { status: response.status, body: await parseBody(response) };
		} catch {
			if (signal?.aborted) throw signal.reason;
			const failure: HttpFailure = timeout.aborted ? 'timeout' : 'network';
			if (!hasRetry) throw new HttpError(failure);
			await sleep(backoff(attempt), signal);
		}
	}
};
