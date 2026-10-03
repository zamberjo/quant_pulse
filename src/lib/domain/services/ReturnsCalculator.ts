import { subtractMonths } from '../entities/Range';
import type { SessionPoint } from './calendar';
import { valueAt } from './DistributionStats';

const DAYS_PER_YEAR = 365.25;
/** Tolerated gap between a requested window start and the first available session. */
const WINDOW_START_TOLERANCE_DAYS = 7;

/** Simple returns r_t = P_t / P_{t−1} − 1. */
export function simpleReturns(prices: readonly number[]): number[] {
	const returns: number[] = [];
	for (let index = 1; index < prices.length; index++) {
		returns.push(valueAt(prices, index) / valueAt(prices, index - 1) - 1);
	}
	return returns;
}

/** Continuously compounded returns ln(P_t / P_{t−1}). */
export function logReturns(prices: readonly number[]): number[] {
	return simpleReturns(prices).map((value) => Math.log1p(value));
}

export function totalReturn(prices: readonly number[]): number {
	return valueAt(prices, prices.length - 1) / valueAt(prices, 0) - 1;
}

export function compound(returns: readonly number[]): number {
	let growth = 1;
	for (const value of returns) growth *= 1 + value;
	return growth - 1;
}

/** Geometric annual growth over calendar years (365.25 days). */
export function compoundAnnualGrowthRate(cumulative: number, calendarDays: number): number | null {
	if (calendarDays <= 0 || cumulative <= -1) return null;
	return (1 + cumulative) ** (DAYS_PER_YEAR / calendarDays) - 1;
}

export const TRAILING_PERIODS = ['1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y'] as const;

export type TrailingPeriod = (typeof TRAILING_PERIODS)[number];

export interface TrailingReturn {
	readonly period: TrailingPeriod;
	readonly value: number | null;
}

const TRAILING_MONTHS: Record<Exclude<TrailingPeriod, 'YTD'>, number> = {
	'1M': 1,
	'3M': 3,
	'6M': 6,
	'1Y': 12,
	'3Y': 36,
	'5Y': 60
};

function baseIndex(points: readonly SessionPoint[], startLocalTime: number): number | null {
	let candidate: number | null = null;
	for (let index = 0; index < points.length; index++) {
		const point = points[index];
		if (point === undefined || point.date.localTime > startLocalTime) break;
		candidate = index;
	}
	if (candidate !== null) return candidate;
	const first = points[0];
	const toleranceMs = WINDOW_START_TOLERANCE_DAYS * 86_400_000;
	return first && first.date.localTime - startLocalTime <= toleranceMs ? 0 : null;
}

/**
 * Point-to-point return from the last close on or before the window start to the latest close.
 * YTD uses the last close of the previous calendar year as its base.
 */
export function trailingReturns(points: readonly SessionPoint[]): TrailingReturn[] {
	const last = points.at(-1);
	if (!last) return TRAILING_PERIODS.map((period) => ({ period, value: null }));
	return TRAILING_PERIODS.map((period) => {
		const start =
			period === 'YTD'
				? Date.UTC(last.date.year, 0, 1) - 86_400_000
				: subtractMonths(last.date.localTime, TRAILING_MONTHS[period]);
		const index = baseIndex(points, start);
		const base = index === null ? undefined : points[index];
		return { period, value: base ? last.value / base.value - 1 : null };
	});
}
