<script lang="ts" module>
	import type { DayValues } from '$lib/domain/services/ContributionTiming';

	export interface DayMatrixRow {
		readonly key: string;
		readonly label: string;
		readonly values: DayValues;
		readonly marked: readonly number[];
		readonly trailing?: string;
		readonly summary?: boolean;
	}
</script>

<script lang="ts">
	import { MAX_DAY_OF_MONTH } from '$lib/domain/services/ContributionTiming';
	import { heatBackground, maxMagnitude } from '$lib/ui/charts/heat';
	import { formatPoints } from '$lib/ui/formatters/number';

	interface Props {
		rows: readonly DayMatrixRow[];
		caption: string;
		rowHeader: string;
		trailingHeader?: string;
	}

	let { rows, caption, rowHeader, trailingHeader }: Props = $props();

	const days = Array.from({ length: MAX_DAY_OF_MONTH }, (_, index) => index + 1);
	const scale = $derived(maxMagnitude(rows.map((row) => row.values)));
</script>

<div class="panel overflow-x-auto">
	<table class="w-full min-w-[76rem] border-separate border-spacing-0 text-[0.6875rem]">
		<caption class="sr-only">{caption}</caption>
		<thead>
			<tr class="bg-surface-muted/60">
				<th
					scope="col"
					class="eyebrow sticky left-0 z-10 border-b border-line bg-surface-muted px-3 py-2 text-left"
					>{rowHeader}</th
				>
				{#each days as day (day)}
					<th
						scope="col"
						class="border-b border-line px-1 py-2 text-right num font-medium text-ink-muted"
						>{day}</th
					>
				{/each}
				{#if trailingHeader}
					<th scope="col" class="eyebrow border-b border-l border-line px-3 py-2 text-right"
						>{trailingHeader}</th
					>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.key)}
				<tr class={row.summary ? 'font-semibold' : undefined}>
					<th
						scope="row"
						class={[
							'sticky left-0 z-10 border-b border-line bg-surface px-3 py-1.5 text-left num font-medium whitespace-nowrap',
							row.summary && 'border-t border-t-line-strong'
						]}>{row.label}</th
					>
					{#each row.values as value, index (index)}
						<td
							class={[
								'border-b border-line px-1 py-1.5 text-right num',
								row.summary && 'border-t border-t-line-strong',
								value === null && 'text-ink-muted/60',
								row.marked.includes(index + 1) &&
									'font-semibold outline-2 -outline-offset-2 outline-positive'
							]}
							style:background-color={heatBackground(value, scale, true)}>{formatPoints(value)}</td
						>
					{/each}
					{#if trailingHeader}
						<td
							class={[
								'border-b border-l border-line px-3 py-1.5 text-right num font-semibold',
								row.summary && 'border-t border-t-line-strong'
							]}>{row.trailing ?? '—'}</td
						>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
