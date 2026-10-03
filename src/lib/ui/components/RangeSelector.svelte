<script lang="ts">
	import { RANGES, type Range } from '$lib/domain/entities/Range';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import { tickerHref } from '$lib/ui/navigation';

	interface Props {
		ticker: string;
		range: Range;
	}

	let { ticker, range }: Props = $props();
</script>

<nav aria-label={i18n.t.layout.lookbackRange} class="overflow-x-auto">
	<ul class="flex w-max rounded-md border border-line bg-surface p-0.5">
		{#each RANGES as option (option)}
			<li>
				<a
					href={tickerHref(ticker, option)}
					aria-current={option === range ? 'page' : undefined}
					data-sveltekit-noscroll
					data-sveltekit-replacestate
					class={[
						'block rounded-[0.25rem] px-2.5 py-1 num text-xs font-medium',
						option === range
							? 'bg-accent text-on-accent'
							: 'text-ink-muted hover:bg-surface-muted hover:text-ink'
					]}>{option}</a
				>
			</li>
		{/each}
	</ul>
</nav>
