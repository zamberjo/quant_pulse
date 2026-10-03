import type { PriceSeries } from '$lib/domain/entities/PriceSeries';
import { InsufficientDataError } from '$lib/domain/errors/DomainError';
import { daysBetween, toSessionDate, type SessionPoint } from '$lib/domain/services/calendar';
import { analyzeContributionTiming } from '$lib/domain/services/ContributionTiming';
import { describeDistribution, mean } from '$lib/domain/services/DistributionStats';
import { analyzeDrawdowns } from '$lib/domain/services/DrawdownAnalyzer';
import {
	calendarMatrix,
	monthlyReturns,
	weekdayAverages,
	type MonthlyReturn
} from '$lib/domain/services/PeriodAggregator';
import {
	compoundAnnualGrowthRate,
	logReturns,
	simpleReturns,
	totalReturn,
	trailingReturns
} from '$lib/domain/services/ReturnsCalculator';
import {
	annualizedVolatility,
	calmarRatio,
	conditionalValueAtRisk,
	downsideDeviation,
	historicalValueAtRisk,
	sharpeRatio,
	sortinoRatio
} from '$lib/domain/services/RiskMetrics';
import type { AnalyticsReport, AnalyticsSettings, DatedValue } from '../dto/AnalyticsReport';

export const MINIMUM_SESSIONS = 3;

function extreme<T extends { value: number }>(items: readonly T[], pick: 'max' | 'min'): T | null {
	let selected: T | null = null;
	for (const item of items) {
		if (!selected || (pick === 'max' ? item.value > selected.value : item.value < selected.value)) {
			selected = item;
		}
	}
	return selected;
}

function requireExtreme(items: readonly DatedValue[], pick: 'max' | 'min'): DatedValue {
	const selected = extreme(items, pick);
	if (!selected) throw new InsufficientDataError(1, 0);
	return selected;
}

export function buildAnalyticsReport(
	series: PriceSeries,
	settings: AnalyticsSettings
): AnalyticsReport {
	const points: SessionPoint[] = series.bars.map((bar) => ({
		date: toSessionDate(bar.time, series.utcOffsetSeconds),
		value: bar.adjustedClose
	}));
	const first = points[0];
	const last = points.at(-1);
	if (!first || !last || points.length < MINIMUM_SESSIONS) {
		throw new InsufficientDataError(MINIMUM_SESSIONS, points.length);
	}

	const { riskFreeRate, periodsPerYear } = settings;
	const prices = points.map((point) => point.value);
	const returns = simpleReturns(prices);
	const returnPoints: SessionPoint[] = returns.map((value, index) => ({
		date: (points[index + 1] ?? last).date,
		value
	}));
	const dailyReturns: DatedValue[] = returnPoints.map(({ date, value }) => ({
		date: date.iso,
		value
	}));

	const calendarDays = daysBetween(first.date, last.date);
	const cumulative = totalReturn(prices);
	const cagr = compoundAnnualGrowthRate(cumulative, calendarDays);
	const drawdowns = analyzeDrawdowns(points);
	const distribution = describeDistribution(returns);
	const monthly = monthlyReturns(points);

	return {
		period: {
			startDate: first.date.iso,
			endDate: last.date.iso,
			sessions: points.length,
			calendarDays
		},
		returns: { cumulative, cagr, trailing: trailingReturns(points) },
		risk: {
			volatility: annualizedVolatility(returns, periodsPerYear),
			downsideDeviation: downsideDeviation(returns, riskFreeRate / periodsPerYear, periodsPerYear),
			sharpe: sharpeRatio(returns, riskFreeRate, periodsPerYear),
			sortino: sortinoRatio(returns, riskFreeRate, periodsPerYear),
			calmar: calmarRatio(cagr, drawdowns.maximum?.depth ?? 0),
			maxDrawdown: drawdowns.maximum,
			currentDrawdown: drawdowns.current,
			valueAtRisk95: historicalValueAtRisk(returns, 0.95),
			valueAtRisk99: historicalValueAtRisk(returns, 0.99),
			expectedShortfall95: conditionalValueAtRisk(returns, 0.95)
		},
		distribution: {
			mean: distribution.mean,
			median: distribution.median,
			standardDeviation: distribution.standardDeviation,
			meanLogReturn: mean(logReturns(prices)),
			skewness: distribution.skewness,
			excessKurtosis: distribution.excessKurtosis,
			positiveRatio: distribution.positiveRatio,
			bestDay: requireExtreme(dailyReturns, 'max'),
			worstDay: requireExtreme(dailyReturns, 'min'),
			bestMonth: extreme<MonthlyReturn>(monthly, 'max'),
			worstMonth: extreme<MonthlyReturn>(monthly, 'min')
		},
		dailyReturns,
		monthlyReturns: monthly,
		calendar: calendarMatrix(monthly),
		weekdays: weekdayAverages(returnPoints),
		contribution: analyzeContributionTiming(points)
	};
}
