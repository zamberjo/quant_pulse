<script lang="ts">
	import ArrowDownRight from '@lucide/svelte/icons/arrow-down-right';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Star from '@lucide/svelte/icons/star';
	import type { Quote } from '$lib/domain/entities/Quote';
	import { formatMarketTime } from '$lib/ui/formatters/date';
	import { formatCompact, formatPercent, formatPrice, toneOf } from '$lib/ui/formatters/number';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';

	interface Props {
		quote: Quote;
		watched: boolean;
		onToggleWatch: () => void;
	}

	let { quote, watched, onToggleWatch }: Props = $props();

	const tone = $derived(toneOf(quote.change));
	const rangePosition = $derived.by(() => {
		const { fiftyTwoWeekLow: low, fiftyTwoWeekHigh: high, price } = quote;
		if (low === null || high === null || high <= low) return null;
		return Math.min(1, Math.max(0, (price - low) / (high - low)));
	});
</script>

<section
	class="panel flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between"
	aria-labelledby="quote-name"
>
	<div class="flex min-w-0 flex-col gap-1.5">
		<p class="eyebrow flex flex-wrap items-center gap-x-2">
			<span class="num text-ink">{quote.ticker}</span>
			{#if quote.exchange}<span aria-hidden="true">·</span><span>{quote.exchange}</span>{/if}
			{#if quote.instrumentType}<span aria-hidden="true">·</span><span>{quote.instrumentType}</span
				>{/if}
			{#if quote.currency}<span aria-hidden="true">·</span><span class="num">{quote.currency}</span
				>{/if}
		</p>
		<div class="flex items-center gap-2">
			<h1 id="quote-name" class="truncate text-xl font-semibold tracking-tight sm:text-2xl">
				{quote.name}
			</h1>
			<button
				type="button"
				class="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink"
				aria-pressed={watched}
				aria-label={i18n.t.watchlist.toggle(quote.ticker)}
				onclick={onToggleWatch}
			>
				<Star class={['size-4', watched && 'fill-current text-accent']} aria-hidden="true" />
			</button>
		</div>
		<div
			class="flex flex-wrap items-baseline gap-x-4 gap-y-1"
			aria-live="polite"
			aria-atomic="true"
		>
			<span class="num text-3xl font-semibold tracking-tight"
				>{formatPrice(quote.price, quote.currency)}</span
			>
			<span
				class={[
					'inline-flex items-center gap-1 num text-sm font-medium',
					tone === 'positive' && 'text-positive',
					tone === 'negative' && 'text-negative'
				]}
			>
				{#if tone === 'positive'}<ArrowUpRight class="size-4" aria-hidden="true" />{/if}
				{#if tone === 'negative'}<ArrowDownRight class="size-4" aria-hidden="true" />{/if}
				{formatPrice(quote.change, quote.currency, { signed: true })}
				({formatPercent(quote.changePercent)})
			</span>
		</div>
		<p class="text-xs text-ink-muted">
			{i18n.t.quote.asOf}
			<time datetime={new Date(quote.marketTime).toISOString()}
				>{formatMarketTime(quote.marketTime, quote.timeZone)}</time
			>
			{#if quote.volume !== null}<span class="mx-1.5" aria-hidden="true">·</span>{i18n.t.quote
					.volume}
				<span class="num">{formatCompact(quote.volume)}</span>{/if}
		</p>
	</div>

	{#if rangePosition !== null}
		<div class="w-full lg:w-80">
			<p class="eyebrow mb-2">{i18n.t.quote.fiftyTwoWeekRange}</p>
			<div
				class="relative h-1.5 rounded-full bg-surface-muted"
				role="img"
				aria-label={i18n.t.quote.rangePosition(Math.round(rangePosition * 100))}
			>
				<div
					class="absolute inset-y-0 left-0 rounded-full bg-accent-soft/40"
					style:width="{rangePosition * 100}%"
				></div>
				<div
					class="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent"
					style:left="{rangePosition * 100}%"
				></div>
			</div>
			<div class="mt-2 flex justify-between num text-xs text-ink-muted">
				<span>{formatPrice(quote.fiftyTwoWeekLow, quote.currency)}</span>
				<span>{formatPrice(quote.fiftyTwoWeekHigh, quote.currency)}</span>
			</div>
		</div>
	{/if}
</section>
