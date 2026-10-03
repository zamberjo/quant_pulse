import { resolve } from '$app/paths';
import { DEFAULT_RANGE, type Range } from '$lib/domain/entities/Range';

export function homeHref(): string {
	return resolve('/');
}

export function tickerHref(ticker: string, range: Range): string {
	const path = resolve('/[ticker]', { ticker });
	return range === DEFAULT_RANGE ? path : `${path}?range=${range}`;
}
