const MS_PER_DAY = 86_400_000;

export interface SessionDate {
	/** ISO calendar date (YYYY-MM-DD) in the exchange's local time. */
	readonly iso: string;
	readonly year: number;
	/** Calendar month, 1–12. */
	readonly month: number;
	readonly day: number;
	/** ISO weekday, 1 (Monday) – 7 (Sunday). */
	readonly weekday: number;
	readonly epochDay: number;
	/** Local midnight expressed as a UTC epoch in milliseconds. */
	readonly localTime: number;
}

export interface SessionPoint {
	readonly date: SessionDate;
	readonly value: number;
}

export function toSessionDate(timeMs: number, utcOffsetSeconds: number): SessionDate {
	const shifted = new Date(timeMs + utcOffsetSeconds * 1000);
	const year = shifted.getUTCFullYear();
	const month = shifted.getUTCMonth() + 1;
	const day = shifted.getUTCDate();
	const localTime = Date.UTC(year, month - 1, day);
	return {
		iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
		year,
		month,
		day,
		weekday: shifted.getUTCDay() === 0 ? 7 : shifted.getUTCDay(),
		epochDay: Math.round(localTime / MS_PER_DAY),
		localTime
	};
}

export function daysBetween(start: SessionDate, end: SessionDate): number {
	return end.epochDay - start.epochDay;
}
