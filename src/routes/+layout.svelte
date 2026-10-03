<script lang="ts">
	import '../app.css';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { parseRange } from '$lib/domain/entities/Range';
	import ProgressBar from '$lib/ui/components/ProgressBar.svelte';
	import RangeSelector from '$lib/ui/components/RangeSelector.svelte';
	import ThemeToggle from '$lib/ui/components/ThemeToggle.svelte';
	import TickerSearch from '$lib/ui/components/TickerSearch.svelte';
	import WatchlistSheet from '$lib/ui/components/WatchlistSheet.svelte';
	import LanguageSwitcher from '$lib/ui/components/LanguageSwitcher.svelte';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import { homeHref } from '$lib/ui/navigation';
	import { recentTickers, watchlist } from '$lib/ui/state/tickerLists.svelte';

	let { children }: { children: Snippet } = $props();

	const ticker = $derived(page.params.ticker?.toUpperCase());
	const range = $derived(parseRange(page.url.searchParams.get('range')));

	$effect(() => {
		watchlist.load();
		recentTickers.load();
	});
</script>

<a
	href="#main"
	class="sr-only z-50 rounded-md bg-accent px-3 py-2 text-on-accent focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
	>{i18n.t.layout.skipToContent}</a
>

<header class="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-sm">
	<div
		class="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6"
	>
		<a href={homeHref()} class="flex shrink-0 items-center gap-2" aria-label={i18n.t.layout.home}>
			<span class="grid size-8 place-items-center rounded-md bg-navy-900 text-navy-300">
				<ChartColumn class="size-4" aria-hidden="true" />
			</span>
			<span class="text-[0.9375rem] font-semibold tracking-tight">
				Quant<span class="text-accent-soft">Pulse</span>
			</span>
		</a>
		<div class="order-last w-full sm:order-none sm:w-auto sm:max-w-sm sm:flex-1">
			<TickerSearch {range} current={ticker} />
		</div>
		{#if ticker}
			<div class="order-last w-full sm:w-auto lg:order-none">
				<RangeSelector {ticker} {range} />
			</div>
		{/if}
		<div class="ml-auto flex items-center gap-2">
			<WatchlistSheet {range} current={ticker} />
			<LanguageSwitcher />
			<ThemeToggle />
		</div>
	</div>
	<ProgressBar />
</header>

<main id="main" class="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8">
	{@render children()}
</main>

<footer class="border-t border-line">
	<div
		class="mx-auto flex max-w-screen-2xl flex-col gap-1 px-4 py-6 text-xs text-ink-muted sm:flex-row sm:justify-between sm:px-6"
	>
		<p>{i18n.t.layout.footerLocal}</p>
		<p>{i18n.t.layout.footerData}</p>
	</div>
</footer>
