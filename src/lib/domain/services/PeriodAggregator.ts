import type { SessionPoint } from './calendar';
import { mean } from './DistributionStats';
import { compound } from './ReturnsCalculator';

export interface MonthlyReturn {
	readonly year: number;
	readonly month: number;
	readonly value: number;
}

export interface CalendarYear {
	readonly year: number;
	readonly months: readonly (number | null)[];
	readonly total: number;
}

export interface WeekdayAverage {
	readonly weekday: number;
	readonly mean: number;
	readonly count: number;
}

/**
 * Calendar-month returns from the last close of the previous month to the last close of the month.
 * The first month is measured from the first available close, so it may be partial.
 */
export function monthlyReturns(points: readonly SessionPoint[]): MonthlyReturn[] {
	const first = points[0];
	if (!first) return [];
	const result: MonthlyReturn[] = [];
	let base = first.value;
	let current = first;
	for (const point of points) {
		if (point.date.year !== current.date.year || point.date.month !== current.date.month) {
			result.push({
				year: current.date.year,
				month: current.date.month,
				value: current.value / base - 1
			});
			base = current.value;
		}
		current = point;
	}
	result.push({
		year: current.date.year,
		month: current.date.month,
		value: current.value / base - 1
	});
	return result;
}

export function calendarMatrix(monthly: readonly MonthlyReturn[]): CalendarYear[] {
	const years = new Map<number, (number | null)[]>();
	for (const { year, month, value } of monthly) {
		const months = years.get(year) ?? Array.from({ length: 12 }, () => null);
		months[month - 1] = value;
		years.set(year, months);
	}
	return [...years.entries()]
		.sort(([a], [b]) => b - a)
		.map(([year, months]) => ({
			year,
			months,
			total: compound(months.filter((value): value is number => value !== null))
		}));
}

export function weekdayAverages(returns: readonly SessionPoint[]): WeekdayAverage[] {
	const buckets = new Map<number, number[]>();
	for (const { date, value } of returns) {
		const bucket = buckets.get(date.weekday) ?? [];
		bucket.push(value);
		buckets.set(date.weekday, bucket);
	}
	return [...buckets.entries()]
		.sort(([a], [b]) => a - b)
		.map(([weekday, values]) => ({ weekday, mean: mean(values), count: values.length }));
}
