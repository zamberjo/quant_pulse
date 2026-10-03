<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { goto } from '$app/navigation';
	import type { Range } from '$lib/domain/entities/Range';
	import { isValidTicker, parseTicker } from '$lib/domain/entities/Ticker';
	import { recentTickers, watchlist } from '$lib/ui/state/tickerLists.svelte';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import { tickerHref } from '$lib/ui/navigation';

	interface Props {
		range: Range;
		current?: string | undefined;
	}

	let { range, current }: Props = $props();

	const id = $props.id();
	let value = $state('');
	let invalid = $state(false);

	const suggestions = $derived([...new Set([...recentTickers.items, ...watchlist.items])]);

	$effect(() => {
		value = current ?? '';
		invalid = false;
	});

	async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		if (!isValidTicker(value)) {
			invalid = true;
			return;
		}
		invalid = false;
		const ticker = parseTicker(value);
		(document.activeElement as HTMLElement | null)?.blur();
		await goto(tickerHref(ticker, range));
	}
</script>

<form role="search" class="relative w-full" onsubmit={submit} novalidate>
	<label for="{id}-input" class="sr-only">{i18n.t.search.label}</label>
	<Search
		class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
		aria-hidden="true"
	/>
	<input
		id="{id}-input"
		name="ticker"
		type="search"
		bind:value
		list="{id}-suggestions"
		autocomplete="off"
		autocapitalize="characters"
		spellcheck="false"
		enterkeyhint="search"
		maxlength="20"
		placeholder={i18n.t.search.placeholder}
		aria-invalid={invalid}
		aria-describedby={invalid ? `${id}-error` : undefined}
		oninput={() => {
			value = value.toUpperCase();
			invalid = false;
		}}
		class={[
			'h-9 w-full rounded-md border bg-surface pr-3 pl-9 num text-sm uppercase placeholder:font-sans placeholder:text-ink-muted placeholder:normal-case focus:outline-2 focus:outline-offset-0 focus:outline-accent',
			invalid ? 'border-negative' : 'border-line'
		]}
	/>
	<datalist id="{id}-suggestions">
		{#each suggestions as ticker (ticker)}
			<option value={ticker}></option>
		{/each}
	</datalist>
	{#if invalid}
		<p id="{id}-error" class="absolute top-full left-0 mt-1 text-xs text-negative" role="status">
			{i18n.t.search.invalid}
		</p>
	{/if}
</form>
