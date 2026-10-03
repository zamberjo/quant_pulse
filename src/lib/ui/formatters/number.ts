import { i18n } from '$lib/ui/i18n/i18n.svelte';

const MINUS = '−';
const EMPTY = '—';

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
	const locale = i18n.intl;
	const key = locale + JSON.stringify(options);
	let cached = formatters.get(key);
	if (!cached) {
		cached = new Intl.NumberFormat(locale, options);
		formatters.set(key, cached);
	}
	return cached;
}

function typographic(text: string): string {
	return text.replace('-', MINUS);
}

export type Tone = 'positive' | 'negative' | 'neutral';

export function toneOf(value: number | null | undefined): Tone {
	if (value === null || value === undefined || value === 0 || Number.isNaN(value)) return 'neutral';
	return value > 0 ? 'positive' : 'negative';
}

export function formatPercent(
	value: number | null | undefined,
	{ digits = 2, signed = true }: { digits?: number; signed?: boolean } = {}
): string {
	if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;
	return typographic(
		formatter({
			style: 'percent',
			minimumFractionDigits: digits,
			maximumFractionDigits: digits,
			signDisplay: signed ? 'exceptZero' : 'auto'
		}).format(value)
	);
}

export function formatDecimal(value: number | null | undefined, digits = 2): string {
	if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;
	return typographic(
		formatter({ minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)
	);
}

export function formatInteger(value: number | null | undefined): string {
	if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;
	return formatter({ maximumFractionDigits: 0 }).format(value);
}

export function formatCompact(value: number | null | undefined): string {
	if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;
	return formatter({ notation: 'compact', maximumFractionDigits: 2 }).format(value);
}

/** Minor-unit quotes such as GBp (pence) are not ISO 4217 codes and are rendered as a suffix. */
export function formatPrice(
	value: number | null | undefined,
	currency: string,
	{ signed = false }: { signed?: boolean } = {}
): string {
	if (value === null || value === undefined || !Number.isFinite(value)) return EMPTY;
	const signDisplay = signed ? 'exceptZero' : 'auto';
	const digits = Math.abs(value) >= 1 || value === 0 ? 2 : 4;
	const isIsoCode = /^[A-Z]{3}$/.test(currency);
	if (!isIsoCode) {
		const amount = formatter({
			minimumFractionDigits: digits,
			maximumFractionDigits: digits,
			signDisplay
		}).format(value);
		return typographic(currency ? `${amount} ${currency}` : amount);
	}
	return typographic(
		formatter({
			style: 'currency',
			currency,
			currencyDisplay: 'narrowSymbol',
			minimumFractionDigits: digits,
			maximumFractionDigits: digits,
			signDisplay
		}).format(value)
	);
}
