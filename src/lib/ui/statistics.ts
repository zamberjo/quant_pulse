import type { AnalyticsReport } from '$lib/application/dto/AnalyticsReport';
import type { MonthlyReturn } from '$lib/domain/services/PeriodAggregator';
import { formatMonth, formatSessionDate } from './formatters/date';
import {
	formatDecimal,
	formatInteger,
	formatPercent,
	toneOf,
	type Tone
} from './formatters/number';
import type { Messages } from './i18n/en';

export interface StatisticRow {
	readonly label: string;
	readonly value: string;
	readonly detail?: string;
	readonly tone: Tone;
}

export interface StatisticGroup {
	readonly title: string;
	readonly rows: readonly StatisticRow[];
}

function percentRow(label: string, value: number | null, detail?: string): StatisticRow {
	return { label, value: formatPercent(value), tone: toneOf(value), ...(detail ? { detail } : {}) };
}

function ratioRow(label: string, value: number | null): StatisticRow {
	return { label, value: formatDecimal(value), tone: toneOf(value) };
}

function neutralRow(label: string, value: string): StatisticRow {
	return { label, value, tone: 'neutral' };
}

function monthRow(label: string, month: MonthlyReturn | null): StatisticRow {
	return percentRow(
		label,
		month?.value ?? null,
		month ? formatMonth(month.year, month.month) : undefined
	);
}

export function statisticGroups(report: AnalyticsReport, t: Messages): StatisticGroup[] {
	const { returns, risk, distribution, period } = report;
	const { rows, groups, trailing } = t.statistics;
	const drawdown = risk.maxDrawdown;
	const recovery = drawdown
		? drawdown.recoveryDate
			? formatSessionDate(drawdown.recoveryDate)
			: rows.notRecovered
		: '—';
	return [
		{
			title: groups.returns,
			rows: [
				percentRow(rows.cumulative, returns.cumulative),
				percentRow(rows.cagr, returns.cagr, rows.annualized),
				...returns.trailing
					.filter((entry) => entry.value !== null)
					.map((entry) => percentRow(trailing[entry.period], entry.value)),
				neutralRow(rows.sessions, formatInteger(period.sessions))
			]
		},
		{
			title: groups.risk,
			rows: [
				neutralRow(rows.volatility, formatPercent(risk.volatility, { signed: false })),
				neutralRow(
					rows.downsideDeviation,
					formatPercent(risk.downsideDeviation, { signed: false })
				),
				ratioRow(rows.sharpe, risk.sharpe),
				ratioRow(rows.sortino, risk.sortino),
				ratioRow(rows.calmar, risk.calmar),
				percentRow(rows.maxDrawdown, drawdown?.depth ?? 0),
				neutralRow(rows.drawdownPeak, formatSessionDate(drawdown?.peakDate)),
				neutralRow(rows.drawdownTrough, formatSessionDate(drawdown?.troughDate)),
				neutralRow(rows.recovery, recovery),
				neutralRow(
					rows.drawdownDuration,
					drawdown ? rows.days(formatInteger(drawdown.durationDays)) : '—'
				),
				percentRow(rows.currentDrawdown, risk.currentDrawdown),
				percentRow(rows.valueAtRisk95, risk.valueAtRisk95, rows.historical),
				percentRow(rows.valueAtRisk99, risk.valueAtRisk99, rows.historical),
				percentRow(rows.expectedShortfall, risk.expectedShortfall95, rows.cvar)
			]
		},
		{
			title: groups.distribution,
			rows: [
				percentRow(rows.meanDaily, distribution.mean),
				percentRow(rows.medianDaily, distribution.median),
				neutralRow(
					rows.dailyStandardDeviation,
					formatPercent(distribution.standardDeviation, { signed: false })
				),
				percentRow(rows.meanLog, distribution.meanLogReturn),
				neutralRow(rows.skewness, formatDecimal(distribution.skewness, 3)),
				neutralRow(rows.kurtosis, formatDecimal(distribution.excessKurtosis, 3)),
				neutralRow(
					rows.positiveSessions,
					formatPercent(distribution.positiveRatio, { signed: false })
				),
				percentRow(
					rows.bestSession,
					distribution.bestDay.value,
					formatSessionDate(distribution.bestDay.date)
				),
				percentRow(
					rows.worstSession,
					distribution.worstDay.value,
					formatSessionDate(distribution.worstDay.date)
				),
				monthRow(rows.bestMonth, distribution.bestMonth),
				monthRow(rows.worstMonth, distribution.worstMonth)
			]
		}
	];
}
