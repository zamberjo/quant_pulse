export const RANGES = ['1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y', 'MAX'] as const;

export type Range = (typeof RANGES)[number];

export const DEFAULT_RANGE: Range = '1Y';

const MONTHS_BACK: Record<Exclude<Range, 'YTD' | 'MAX'>, number> = {
	'1M': 1,
	'3M': 3,
	'6M': 6,
	'1Y': 12,
	'3Y': 36,
	'5Y': 60,
	'10Y': 120
};

export function parseRange(input: string | null | undefined): Range {
	const candidate = input?.toUpperCase();
	return RANGES.find((range) => range === candidate) ?? DEFAULT_RANGE;
}

export function subtractMonths(timeMs: number, months: number): number {
	const date = new Date(timeMs);
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth() - months;
	const lastDayOfTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	return Date.UTC(
		year,
		month,
		Math.min(date.getUTCDate(), lastDayOfTargetMonth),
		date.getUTCHours(),
		date.getUTCMinutes()
	);
}

/** Inclusive UTC start of the range, or null when the full history is requested. */
export function rangeStart(range: Range, nowMs: number): number | null {
	if (range === 'MAX') return null;
	if (range === 'YTD') return Date.UTC(new Date(nowMs).getUTCFullYear(), 0, 1);
	return subtractMonths(nowMs, MONTHS_BACK[range]);
}
