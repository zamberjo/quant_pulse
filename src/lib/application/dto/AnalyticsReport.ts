import type { DrawdownEpisode } from '$lib/domain/services/DrawdownAnalyzer';
import type {
	CalendarYear,
	MonthlyReturn,
	WeekdayAverage
} from '$lib/domain/services/PeriodAggregator';
import type { TrailingReturn } from '$lib/domain/services/ReturnsCalculator';

export interface DatedValue {
	readonly date: string;
	readonly value: number;
}

export interface AnalyticsSettings {
	readonly riskFreeRate: number;
	readonly periodsPerYear: number;
}

export interface AnalyticsReport {
	readonly period: {
		readonly startDate: string;
		readonly endDate: string;
		readonly sessions: number;
		readonly calendarDays: number;
	};
	readonly returns: {
		readonly cumulative: number;
		readonly cagr: number | null;
		readonly trailing: readonly TrailingReturn[];
	};
	readonly risk: {
		readonly volatility: number;
		readonly downsideDeviation: number;
		readonly sharpe: number | null;
		readonly sortino: number | null;
		readonly calmar: number | null;
		readonly maxDrawdown: DrawdownEpisode | null;
		readonly currentDrawdown: number;
		readonly valueAtRisk95: number;
		readonly valueAtRisk99: number;
		readonly expectedShortfall95: number;
	};
	readonly distribution: {
		readonly mean: number;
		readonly median: number;
		readonly standardDeviation: number;
		readonly meanLogReturn: number;
		readonly skewness: number | null;
		readonly excessKurtosis: number | null;
		readonly positiveRatio: number;
		readonly bestDay: DatedValue;
		readonly worstDay: DatedValue;
		readonly bestMonth: MonthlyReturn | null;
		readonly worstMonth: MonthlyReturn | null;
	};
	readonly dailyReturns: readonly DatedValue[];
	readonly monthlyReturns: readonly MonthlyReturn[];
	readonly calendar: readonly CalendarYear[];
	readonly weekdays: readonly WeekdayAverage[];
}
