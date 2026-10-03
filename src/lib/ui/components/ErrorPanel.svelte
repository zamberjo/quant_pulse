<script lang="ts">
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import { DomainError, MarketDataUnavailableError } from '$lib/domain/errors/DomainError';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';

	interface Props {
		error: unknown;
		ticker: string;
		onRetry: () => void;
	}

	let { error, ticker, onRetry }: Props = $props();

	const copy = $derived.by((): { title: string; detail: string; retryable: boolean } => {
		const { errors } = i18n.t;
		if (error instanceof MarketDataUnavailableError) {
			return { ...errors.unavailable[error.reason], retryable: true };
		}
		if (error instanceof DomainError) {
			switch (error.code) {
				case 'INVALID_TICKER':
					return {
						title: errors.invalidTicker.title,
						detail: errors.invalidTicker.detail(ticker),
						retryable: false
					};
				case 'TICKER_NOT_FOUND':
					return {
						title: errors.notFound.title,
						detail: errors.notFound.detail(ticker),
						retryable: false
					};
				case 'INSUFFICIENT_DATA':
					return { ...errors.insufficientData, retryable: false };
				case 'RATE_LIMITED':
					return { ...errors.rateLimited, retryable: true };
				case 'MARKET_DATA_UNAVAILABLE':
					return { ...errors.unavailable.upstream, retryable: true };
			}
		}
		return { ...errors.generic, retryable: true };
	});

	const Icon = $derived(error instanceof MarketDataUnavailableError ? WifiOff : TriangleAlert);
</script>

<section
	class="panel flex flex-col items-start gap-4 p-6"
	role="alert"
	aria-labelledby="error-title"
>
	<div class="flex items-center gap-3">
		<span class="grid size-9 place-items-center rounded-md border border-line bg-surface-muted">
			<Icon class="size-4 text-negative" aria-hidden="true" />
		</span>
		<h2 id="error-title" class="text-base font-semibold">{copy.title}</h2>
	</div>
	<p class="max-w-prose text-sm text-ink-muted">{copy.detail}</p>
	{#if copy.retryable}
		<button
			type="button"
			class="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-on-accent hover:opacity-90"
			onclick={onRetry}
		>
			<RefreshCw class="size-4" aria-hidden="true" />
			{i18n.t.errors.retry}
		</button>
	{/if}
</section>
