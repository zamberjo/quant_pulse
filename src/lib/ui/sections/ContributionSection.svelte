<script lang="ts">
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import CalendarCheck from '@lucide/svelte/icons/calendar-check';
	import CalendarX from '@lucide/svelte/icons/calendar-x';
	import type { AnalyticsReport } from '$lib/application/dto/AnalyticsReport';
	import type { DayStatistic, DayValues } from '$lib/domain/services/ContributionTiming';
	import BarChart, { type BarDatum } from '$lib/ui/components/BarChart.svelte';
	import DayMatrixTable, { type DayMatrixRow } from '$lib/ui/components/DayMatrixTable.svelte';
	import MetricCard from '$lib/ui/components/MetricCard.svelte';
	import { formatMonthName, monthLabels } from '$lib/ui/formatters/date';
	import { formatPercent } from '$lib/ui/formatters/number';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';

	interface Props {
		report: AnalyticsReport;
	}

	let { report }: Props = $props();

	const LOW_SAMPLE_MONTHS = 24;

	const c = $derived(i18n.t.contribution);
	const timing = $derived(report.contribution);
	const months = $derived(monthLabels());
	const availableMonths = $derived(
		timing.byMonthOfYear.filter((profile) => profile.years > 0).map((profile) => profile.month)
	);

	let chosenMonth = $state<number | null>(null);
	const selectedMonth = $derived.by(() => {
		if (chosenMonth !== null && availableMonths.includes(chosenMonth)) return chosenMonth;
		const current = new Date().getMonth() + 1;
		return availableMonths.includes(current) ? current : (availableMonths[0] ?? 1);
	});

	function cheapest(values: DayValues): number[] {
		const present = values.filter((value): value is number => value !== null);
		if (present.length === 0) return [];
		const minimum = Math.min(...present);
		return values.flatMap((value, index) => (value === minimum ? [index + 1] : []));
	}

	function dayCaption(statistic: DayStatistic): string {
		return c.dayCaption(
			formatPercent(statistic.meanPremium),
			formatPercent(statistic.cheapestShare, { digits: 0, signed: false })
		);
	}

	const chartData = $derived<BarDatum[]>(
		timing.byDay.map(({ day, meanPremium, observations }) => ({
			key: String(day),
			label: String(day),
			tooltipLabel: c.chartTooltip(day, observations),
			value: meanPremium
		}))
	);

	const monthRows = $derived<DayMatrixRow[]>(
		timing.byMonthOfYear
			.filter((profile) => profile.years > 0)
			.map((profile) => ({
				key: String(profile.month),
				label: months[profile.month - 1] ?? '',
				values: profile.meanPremiums,
				marked: profile.bestDay === null ? [] : [profile.bestDay],
				trailing: profile.bestDay === null ? '—' : String(profile.bestDay)
			}))
	);

	const historyRows = $derived.by<DayMatrixRow[]>(() => {
		const profile = timing.byMonthOfYear[selectedMonth - 1];
		const years = timing.history
			.filter((entry) => entry.month === selectedMonth)
			.toReversed()
			.map((entry) => ({
				key: String(entry.year),
				label: String(entry.year),
				values: entry.premiums,
				marked: cheapest(entry.premiums)
			}));
		if (!profile) return years;
		return [
			...years,
			{
				key: 'average',
				label: c.average,
				values: profile.meanPremiums,
				marked: profile.bestDay === null ? [] : [profile.bestDay],
				summary: true
			}
		];
	});

	const percent = (value: number) => formatPercent(value, { digits: 2 });
</script>

<section class="flex flex-col gap-4" aria-labelledby="contribution-heading">
	<header class="flex flex-col gap-1">
		<h2 id="contribution-heading" class="text-sm font-semibold">{c.heading}</h2>
		{#if timing.months > 0 && timing.firstYear !== null && timing.lastYear !== null}
			<p class="max-w-4xl text-sm text-ink-muted">
				{c.intro(timing.months, timing.firstYear, timing.lastYear)}
			</p>
		{/if}
		<p class="max-w-4xl text-xs text-ink-muted">{c.methodology}</p>
	</header>

	{#if timing.months === 0 || !timing.bestDay || !timing.worstDay}
		<p class="panel p-4 text-sm text-ink-muted">{c.empty}</p>
	{:else}
		{#if timing.months < LOW_SAMPLE_MONTHS}
			<p
				class="rounded-md border border-line-strong bg-surface-muted px-4 py-2.5 text-xs"
				role="note"
			>
				{c.lowSample(timing.months)}
			</p>
		{/if}

		<div class="grid gap-3 sm:grid-cols-3">
			<MetricCard
				label={c.bestDay}
				icon={CalendarCheck}
				value={c.day(timing.bestDay.day)}
				tone="positive"
				caption={dayCaption(timing.bestDay)}
				formula={c.dayFormula}
			/>
			<MetricCard
				label={c.worstDay}
				icon={CalendarX}
				value={c.day(timing.worstDay.day)}
				tone="negative"
				caption={dayCaption(timing.worstDay)}
				formula={c.dayFormula}
			/>
			<MetricCard
				label={c.spread}
				icon={ArrowLeftRight}
				value={formatPercent(timing.worstDay.meanPremium - timing.bestDay.meanPremium, {
					signed: false
				})}
				caption={c.spreadCaption}
				formula={c.spreadFormula}
			/>
		</div>

		<section class="panel flex flex-col gap-3 p-4 sm:p-5">
			<header class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<h3 class="text-sm font-semibold">{c.chartTitle}</h3>
				<p class="text-xs text-ink-muted">{c.unit}</p>
			</header>
			<BarChart
				data={chartData}
				title={c.chartTitle}
				description={c.chartDescription}
				format={percent}
				invertTone
			/>
		</section>

		<section class="flex flex-col gap-3" aria-labelledby="contribution-matrix-heading">
			<header class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<h3 id="contribution-matrix-heading" class="text-sm font-semibold">{c.matrixHeading}</h3>
				<p class="text-xs text-ink-muted">{c.unit} · {c.cheapestMarked}</p>
			</header>
			<DayMatrixTable
				rows={monthRows}
				caption={c.matrixCaption}
				rowHeader={c.month}
				trailingHeader={c.best}
			/>
		</section>

		<section class="flex flex-col gap-3" aria-labelledby="contribution-history-heading">
			<header class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
				<h3 id="contribution-history-heading" class="text-sm font-semibold">{c.historyHeading}</h3>
				<div
					class="flex flex-wrap rounded-md border border-line bg-surface p-0.5"
					role="group"
					aria-label={c.historyMonth}
				>
					{#each months as label, index (index)}
						{@const month = index + 1}
						<button
							type="button"
							disabled={!availableMonths.includes(month)}
							aria-pressed={month === selectedMonth}
							onclick={() => (chosenMonth = month)}
							class={[
								'rounded-[0.25rem] px-2 py-1 text-xs font-medium disabled:opacity-40',
								month === selectedMonth
									? 'bg-accent text-on-accent'
									: 'text-ink-muted enabled:hover:bg-surface-muted enabled:hover:text-ink'
							]}>{label}</button
						>
					{/each}
				</div>
			</header>
			<p class="text-xs text-ink-muted">{c.unit} · {c.cheapestMarked}</p>
			<DayMatrixTable
				rows={historyRows}
				caption={c.historyCaption(formatMonthName(selectedMonth))}
				rowHeader={c.year}
			/>
		</section>
	{/if}
</section>
