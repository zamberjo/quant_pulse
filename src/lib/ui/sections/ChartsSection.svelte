<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AnalyticsReport } from '$lib/application/dto/AnalyticsReport';
	import BarChart, { type BarDatum } from '$lib/ui/components/BarChart.svelte';
	import {
		formatMonth,
		formatMonthShort,
		formatSessionDate,
		formatWeekday
	} from '$lib/ui/formatters/date';
	import { formatPercent } from '$lib/ui/formatters/number';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';

	interface Props {
		report: AnalyticsReport;
	}

	let { report }: Props = $props();

	const DAILY_SESSIONS = 126;
	const MONTHS_SHOWN = 60;

	const c = $derived(i18n.t.charts);

	const daily = $derived<BarDatum[]>(
		report.dailyReturns.slice(-DAILY_SESSIONS).map(({ date, value }) => ({
			key: date,
			label: formatSessionDate(date, true),
			tooltipLabel: formatSessionDate(date),
			value
		}))
	);

	const monthly = $derived<BarDatum[]>(
		report.monthlyReturns.slice(-MONTHS_SHOWN).map(({ year, month, value }) => ({
			key: `${year}-${month}`,
			label: formatMonthShort(year, month),
			tooltipLabel: formatMonth(year, month),
			value
		}))
	);

	const weekdays = $derived<BarDatum[]>(
		report.weekdays.map(({ weekday, mean, count }) => ({
			key: String(weekday),
			label: formatWeekday(weekday),
			tooltipLabel: `${formatWeekday(weekday)} · ${c.weekday.sessions(count)}`,
			value: mean
		}))
	);

	const percent = (value: number) => formatPercent(value, { digits: 1 });
	const precisePercent = (value: number) => formatPercent(value, { digits: 2 });
</script>

{#snippet card(title: string, subtitle: string, children: Snippet)}
	<section class="panel flex flex-col gap-3 p-4 sm:p-5">
		<header class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
			<h2 class="text-sm font-semibold">{title}</h2>
			<p class="text-xs text-ink-muted">{subtitle}</p>
		</header>
		{@render children()}
	</section>
{/snippet}

{#snippet dailyChart()}
	<BarChart
		data={daily}
		title={c.daily.title}
		description={c.daily.description(daily.length)}
		format={precisePercent}
		height={240}
	/>
{/snippet}

{#snippet monthlyChart()}
	<BarChart
		data={monthly}
		title={c.monthly.title}
		description={c.monthly.description(monthly.length)}
		format={percent}
	/>
{/snippet}

{#snippet weekdayChart()}
	<BarChart
		data={weekdays}
		title={c.weekday.chartTitle}
		description={c.weekday.description}
		format={precisePercent}
	/>
{/snippet}

<div class="flex flex-col gap-4">
	{@render card(c.daily.title, c.daily.subtitle(daily.length), dailyChart)}
	<div class="grid gap-4 xl:grid-cols-[2fr_1fr]">
		{@render card(c.monthly.title, c.monthly.subtitle(monthly.length), monthlyChart)}
		{@render card(c.weekday.title, c.weekday.subtitle, weekdayChart)}
	</div>
</div>
