import { i18n } from '$lib/ui/i18n/i18n.svelte';

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
	const locale = i18n.intl;
	const key = locale + JSON.stringify(options);
	let cached = formatters.get(key);
	if (!cached) {
		cached = new Intl.DateTimeFormat(locale, options);
		formatters.set(key, cached);
	}
	return cached;
}

function capitalize(text: string): string {
	return text.charAt(0).toLocaleUpperCase(i18n.intl) + text.slice(1);
}

function utcDate(year: number, month: number, day = 1): Date {
	return new Date(Date.UTC(year, month - 1, day));
}

export function monthLabels(): string[] {
	const format = formatter({ month: 'short', timeZone: 'UTC' });
	return Array.from({ length: 12 }, (_, index) =>
		capitalize(format.format(utcDate(2024, index + 1)).replace('.', ''))
	);
}

/** Formats an ISO calendar date (YYYY-MM-DD) without shifting it across time zones. */
export function formatSessionDate(iso: string | null | undefined, short = false): string {
	if (!iso) return '—';
	const options: Intl.DateTimeFormatOptions = short
		? { month: 'short', day: 'numeric', timeZone: 'UTC' }
		: { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' };
	return formatter(options).format(new Date(`${iso}T00:00:00Z`));
}

export function formatMonth(year: number, month: number): string {
	return capitalize(
		formatter({ month: 'short', year: 'numeric', timeZone: 'UTC' }).format(utcDate(year, month))
	);
}

export function formatMonthShort(year: number, month: number): string {
	const label = monthLabels()[month - 1] ?? '';
	return `${label} ’${String(year).slice(-2)}`;
}

/** 2024-01-01 was a Monday, so ISO weekday n maps to 2024-01-n. */
export function formatWeekday(weekday: number): string {
	return capitalize(
		formatter({ weekday: 'short', timeZone: 'UTC' })
			.format(utcDate(2024, 1, weekday))
			.replace('.', '')
	);
}

export function formatMarketTime(timeMs: number, timeZone: string): string {
	if (!timeMs) return '—';
	try {
		return formatter({
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			timeZoneName: 'short',
			timeZone
		}).format(timeMs);
	} catch {
		return new Date(timeMs).toUTCString();
	}
}
