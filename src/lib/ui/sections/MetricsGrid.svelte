<script lang="ts">
	import Activity from '@lucide/svelte/icons/activity';
	import ArrowDownRight from '@lucide/svelte/icons/arrow-down-right';
	import Gauge from '@lucide/svelte/icons/gauge';
	import Percent from '@lucide/svelte/icons/percent';
	import Scale from '@lucide/svelte/icons/scale';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import TrendingDown from '@lucide/svelte/icons/trending-down';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import type { AnalyticsReport } from '$lib/application/dto/AnalyticsReport';
	import MetricCard from '$lib/ui/components/MetricCard.svelte';
	import { formatSessionDate } from '$lib/ui/formatters/date';
	import { formatDecimal, formatPercent, toneOf } from '$lib/ui/formatters/number';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';

	interface Props {
		report: AnalyticsReport;
		riskFreeRate: number;
	}

	let { report, riskFreeRate }: Props = $props();

	const m = $derived(i18n.t.metrics);
	const rf = $derived(formatPercent(riskFreeRate, { signed: false }));
	const drawdown = $derived(report.risk.maxDrawdown);
</script>

<section aria-labelledby="metrics-heading">
	<h2 id="metrics-heading" class="sr-only">{m.heading}</h2>
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		<MetricCard
			label={m.cagr.label}
			icon={TrendingUp}
			value={formatPercent(report.returns.cagr)}
			tone={toneOf(report.returns.cagr)}
			caption={m.cagr.caption}
			formula={m.cagr.formula}
		/>
		<MetricCard
			label={m.volatility.label}
			icon={Activity}
			value={formatPercent(report.risk.volatility, { signed: false })}
			caption={m.volatility.caption}
			formula={m.volatility.formula}
		/>
		<MetricCard
			label={m.sharpe.label}
			icon={Scale}
			value={formatDecimal(report.risk.sharpe)}
			tone={toneOf(report.risk.sharpe)}
			caption={m.sharpe.caption(rf)}
			formula={m.sharpe.formula}
		/>
		<MetricCard
			label={m.sortino.label}
			icon={Gauge}
			value={formatDecimal(report.risk.sortino)}
			tone={toneOf(report.risk.sortino)}
			caption={m.sortino.caption(rf)}
			formula={m.sortino.formula}
		/>
		<MetricCard
			label={m.maxDrawdown.label}
			icon={TrendingDown}
			value={formatPercent(drawdown?.depth ?? 0)}
			tone={toneOf(drawdown?.depth ?? 0)}
			caption={drawdown
				? m.maxDrawdown.caption(
						formatSessionDate(drawdown.peakDate, true),
						formatSessionDate(drawdown.troughDate, true),
						drawdown.recoveryDate !== null
					)
				: m.maxDrawdown.none}
			formula={m.maxDrawdown.formula}
		/>
		<MetricCard
			label={m.currentDrawdown.label}
			icon={ArrowDownRight}
			value={formatPercent(report.risk.currentDrawdown)}
			tone={toneOf(report.risk.currentDrawdown)}
			caption={m.currentDrawdown.caption}
			formula={m.currentDrawdown.formula}
		/>
		<MetricCard
			label={m.valueAtRisk.label}
			icon={ShieldAlert}
			value={formatPercent(report.risk.valueAtRisk95)}
			tone={toneOf(report.risk.valueAtRisk95)}
			caption={m.valueAtRisk.caption}
			formula={m.valueAtRisk.formula}
		/>
		<MetricCard
			label={m.positiveDays.label}
			icon={Percent}
			value={formatPercent(report.distribution.positiveRatio, { signed: false })}
			caption={m.positiveDays.caption}
			formula={m.positiveDays.formula}
		/>
	</div>
</section>
