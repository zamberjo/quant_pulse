import type { SessionPoint } from './calendar';
import { mean, median } from './DistributionStats';

export const MAX_DAY_OF_MONTH = 31;
/** A month counts as complete when its first and last sessions fall within this many days of its edges. */
const EDGE_TOLERANCE_DAYS = 3;

export type DayValues = readonly (number | null)[];

export interface MonthPremiums {
	readonly year: number;
	readonly month: number;
	/** Index d − 1 holds the premium of a contribution scheduled on day d. */
	readonly premiums: DayValues;
}

export interface DayStatistic {
	readonly day: number;
	readonly meanPremium: number;
	readonly medianPremium: number;
	/** Share of months in which this day bought at the month's lowest execution price. */
	readonly cheapestShare: number;
	readonly observations: number;
}

export interface MonthOfYearProfile {
	readonly month: number;
	readonly years: number;
	readonly meanPremiums: DayValues;
	readonly bestDay: number | null;
}

export interface ContributionTiming {
	readonly months: number;
	readonly firstYear: number | null;
	readonly lastYear: number | null;
	readonly byDay: readonly DayStatistic[];
	readonly bestDay: DayStatistic | null;
	readonly worstDay: DayStatistic | null;
	readonly byMonthOfYear: readonly MonthOfYearProfile[];
	readonly history: readonly MonthPremiums[];
}

function daysInMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function groupByMonth(points: readonly SessionPoint[]): SessionPoint[][] {
	const groups: SessionPoint[][] = [];
	let current: SessionPoint[] = [];
	for (const point of points) {
		const previous = current[0];
		if (
			previous &&
			(previous.date.year !== point.date.year || previous.date.month !== point.date.month)
		) {
			groups.push(current);
			current = [];
		}
		current.push(point);
	}
	if (current.length > 0) groups.push(current);
	return groups;
}

function isComplete(sessions: readonly SessionPoint[]): boolean {
	const first = sessions[0];
	const last = sessions.at(-1);
	if (!first || !last) return false;
	const length = daysInMonth(first.date.year, first.date.month);
	return first.date.day <= 1 + EDGE_TOLERANCE_DAYS && last.date.day >= length - EDGE_TOLERANCE_DAYS;
}

/**
 * A contribution scheduled on day d executes at the first session on or after d, or at the
 * month's last session when none remains (including days the month does not have, e.g. Feb 30).
 */
function executionPrices(sessions: readonly SessionPoint[]): (number | null)[] {
	const prices: (number | null)[] = [];
	let index = 0;
	for (let day = 1; day <= MAX_DAY_OF_MONTH; day++) {
		while (index < sessions.length - 1 && (sessions[index]?.date.day ?? day) < day) index++;
		prices.push(sessions[index]?.value ?? null);
	}
	return prices;
}

function monthPremiums(sessions: readonly SessionPoint[]): MonthPremiums | null {
	const first = sessions[0];
	if (!first || !isComplete(sessions)) return null;
	const { year, month } = first.date;
	const average = mean(sessions.map((session) => session.value));
	const premiums = executionPrices(sessions).map((price) =>
		price === null ? null : price / average - 1
	);
	return { year, month, premiums };
}

function present(values: DayValues): number[] {
	return values.filter((value): value is number => value !== null);
}

function cheapestDays(premiums: DayValues): Set<number> {
	const minimum = Math.min(...present(premiums));
	const days = new Set<number>();
	premiums.forEach((value, index) => {
		if (value === minimum) days.add(index + 1);
	});
	return days;
}

function argMin(values: DayValues): number | null {
	let best: number | null = null;
	let lowest = Infinity;
	for (let index = 0; index < values.length; index++) {
		const value = values[index];
		if (value === null || value === undefined || value >= lowest) continue;
		lowest = value;
		best = index + 1;
	}
	return best;
}

function dayStatistics(history: readonly MonthPremiums[]): DayStatistic[] {
	const cheapest = history.map((entry) => cheapestDays(entry.premiums));
	const statistics: DayStatistic[] = [];
	for (let day = 1; day <= MAX_DAY_OF_MONTH; day++) {
		const values: number[] = [];
		let cheapestCount = 0;
		history.forEach((entry, index) => {
			const value = entry.premiums[day - 1];
			if (value === null || value === undefined) return;
			values.push(value);
			if (cheapest[index]?.has(day)) cheapestCount++;
		});
		if (values.length === 0) continue;
		statistics.push({
			day,
			meanPremium: mean(values),
			medianPremium: median(values),
			cheapestShare: cheapestCount / values.length,
			observations: values.length
		});
	}
	return statistics;
}

function monthOfYearProfiles(history: readonly MonthPremiums[]): MonthOfYearProfile[] {
	return Array.from({ length: 12 }, (_, index) => {
		const month = index + 1;
		const entries = history.filter((entry) => entry.month === month);
		const meanPremiums = Array.from({ length: MAX_DAY_OF_MONTH }, (_, day) => {
			const values = present(entries.map((entry) => entry.premiums[day] ?? null));
			return values.length > 0 ? mean(values) : null;
		});
		return { month, years: entries.length, meanPremiums, bestDay: argMin(meanPremiums) };
	});
}

/** Compares each calendar day's execution price with its month's average close across complete months. */
export function analyzeContributionTiming(points: readonly SessionPoint[]): ContributionTiming {
	const history = groupByMonth(points)
		.map(monthPremiums)
		.filter((entry): entry is MonthPremiums => entry !== null);
	const byDay = dayStatistics(history);
	const ranked = [...byDay].sort((a, b) => a.meanPremium - b.meanPremium);
	return {
		months: history.length,
		firstYear: history[0]?.year ?? null,
		lastYear: history.at(-1)?.year ?? null,
		byDay,
		bestDay: ranked[0] ?? null,
		worstDay: ranked.at(-1) ?? null,
		byMonthOfYear: monthOfYearProfiles(history),
		history
	};
}
