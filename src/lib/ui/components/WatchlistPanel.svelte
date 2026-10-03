<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { Range } from '$lib/domain/entities/Range';
	import type { Ticker } from '$lib/domain/entities/Ticker';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import { tickerHref } from '$lib/ui/navigation';
	import { recentTickers, watchlist } from '$lib/ui/state/tickerLists.svelte';

	interface Props {
		range: Range;
		current?: string | undefined;
		onNavigate?: () => void;
	}

	let { range, current, onNavigate }: Props = $props();

	const recent = $derived(recentTickers.items.filter((ticker) => !watchlist.has(ticker)));
</script>

{#snippet list(title: string, tickers: readonly Ticker[], removable: boolean, empty: string)}
	<section class="flex flex-col gap-2">
		<h2 class="eyebrow px-1">{title}</h2>
		{#if tickers.length === 0}
			<p class="px-1 text-xs text-ink-muted">{empty}</p>
		{:else}
			<ul class="flex flex-col">
				{#each tickers as ticker (ticker)}
					<li class="group flex items-center justify-between rounded-sm hover:bg-surface-muted">
						<a
							href={tickerHref(ticker, range)}
							onclick={onNavigate}
							aria-current={ticker === current ? 'page' : undefined}
							class={[
								'flex-1 px-2 py-1.5 num text-sm',
								ticker === current ? 'font-semibold text-ink' : 'text-ink-muted hover:text-ink'
							]}>{ticker}</a
						>
						{#if removable}
							<button
								type="button"
								class="mr-1 rounded-sm p-1 text-ink-muted opacity-60 group-hover:opacity-100 hover:text-ink"
								aria-label={i18n.t.watchlist.remove(ticker)}
								onclick={() => watchlist.remove(ticker)}
							>
								<X class="size-3.5" aria-hidden="true" />
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/snippet}

<div class="flex flex-col gap-6">
	{@render list(i18n.t.watchlist.title, watchlist.items, true, i18n.t.watchlist.emptyWatchlist)}
	{@render list(i18n.t.watchlist.recent, recent, false, i18n.t.watchlist.emptyRecent)}
</div>
