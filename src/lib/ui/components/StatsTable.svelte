<script lang="ts">
	import type { StatisticGroup } from '$lib/ui/statistics';

	interface Props {
		groups: readonly StatisticGroup[];
	}

	let { groups }: Props = $props();
</script>

<div class="grid gap-4 lg:grid-cols-3">
	{#each groups as group (group.title)}
		<table class="panel w-full border-separate border-spacing-0 overflow-hidden text-sm">
			<caption class="eyebrow border-b border-line bg-surface-muted/60 px-4 py-2.5 text-left">
				{group.title}
			</caption>
			<tbody>
				{#each group.rows as row (row.label)}
					<tr class="hover:bg-surface-muted/50">
						<th
							scope="row"
							class="border-b border-line px-4 py-2 text-left font-normal text-ink-muted"
						>
							{row.label}
							{#if row.detail}<span class="block text-[0.6875rem] text-ink-muted/80"
									>{row.detail}</span
								>{/if}
						</th>
						<td
							class={[
								'border-b border-line px-4 py-2 text-right num whitespace-nowrap',
								row.tone === 'positive' && 'text-positive',
								row.tone === 'negative' && 'text-negative'
							]}>{row.value}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	{/each}
</div>
