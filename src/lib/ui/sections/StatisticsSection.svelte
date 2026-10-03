<script lang="ts">
	import type { AnalyticsReport } from '$lib/application/dto/AnalyticsReport';
	import CalendarTable from '$lib/ui/components/CalendarTable.svelte';
	import StatsTable from '$lib/ui/components/StatsTable.svelte';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import { statisticGroups } from '$lib/ui/statistics';

	interface Props {
		report: AnalyticsReport;
	}

	let { report }: Props = $props();

	const groups = $derived(statisticGroups(report, i18n.t));
</script>

<div class="flex flex-col gap-8">
	<section class="flex flex-col gap-3" aria-labelledby="statistics-heading">
		<h2 id="statistics-heading" class="text-sm font-semibold">{i18n.t.statistics.heading}</h2>
		<StatsTable {groups} />
	</section>
	<section class="flex flex-col gap-3" aria-labelledby="calendar-heading">
		<h2 id="calendar-heading" class="text-sm font-semibold">
			{i18n.t.statistics.calendarHeading}
		</h2>
		<CalendarTable years={report.calendar} />
	</section>
</div>
