<script lang="ts">
	import type { CalendarYear } from '$lib/domain/services/PeriodAggregator';
	import { monthLabels } from '$lib/ui/formatters/date';
	import { formatPercent } from '$lib/ui/formatters/number';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';

	interface Props {
		years: readonly CalendarYear[];
	}

	let { years }: Props = $props();

	const MAX_TINT = 38;

	const months = $derived(monthLabels());

	const scale = $derived.by(() => {
		let max = 0;
		for (const year of years) {
			for (const value of year.months) if (value !== null) max = Math.max(max, Math.abs(value));
		}
		return max || 1;
	});

	function tint(value: number | null): string | undefined {
		if (value === null || value === 0) return undefined;
		const strength = Math.round(Math.min(1, Math.abs(value) / scale) * MAX_TINT);
		const color = value > 0 ? 'var(--color-positive)' : 'var(--color-negative)';
		return `color-mix(in oklab, ${color} ${strength}%, transparent)`;
	}
</script>

<div class="panel overflow-x-auto">
	<table class="w-full min-w-[56rem] border-separate border-spacing-0 text-xs">
		<caption class="sr-only">{i18n.t.statistics.calendarCaption}</caption>
		<thead>
			<tr class="bg-surface-muted/60">
				<th
					scope="col"
					class="eyebrow sticky left-0 border-b border-line bg-surface-muted px-3 py-2.5 text-left"
					>{i18n.t.statistics.year}</th
				>
				{#each months as month (month)}
					<th scope="col" class="eyebrow border-b border-line px-2 py-2.5 text-right">{month}</th>
				{/each}
				<th scope="col" class="eyebrow border-b border-l border-line px-3 py-2.5 text-right"
					>{i18n.t.statistics.year}</th
				>
			</tr>
		</thead>
		<tbody>
			{#each years as year (year.year)}
				<tr>
					<th
						scope="row"
						class="sticky left-0 border-b border-line bg-surface px-3 py-1.5 text-left num font-medium"
						>{year.year}</th
					>
					{#each year.months as value, index (index)}
						<td
							class={[
								'border-b border-line px-2 py-1.5 text-right num',
								value === null && 'text-ink-muted/60'
							]}
							style:background-color={tint(value)}>{formatPercent(value, { digits: 1 })}</td
						>
					{/each}
					<td
						class={[
							'border-b border-l border-line px-3 py-1.5 text-right num font-semibold',
							year.total > 0 && 'text-positive',
							year.total < 0 && 'text-negative'
						]}>{formatPercent(year.total, { digits: 1 })}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
