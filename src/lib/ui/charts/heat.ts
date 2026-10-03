const MAX_TINT = 38;

export function maxMagnitude(rows: readonly (readonly (number | null)[])[]): number {
	let max = 0;
	for (const row of rows)
		for (const value of row) if (value !== null) max = Math.max(max, Math.abs(value));
	return max || 1;
}

/** Background tint proportional to magnitude; `invert` paints negative values as favorable. */
export function heatBackground(
	value: number | null,
	scale: number,
	invert = false
): string | undefined {
	if (value === null || value === 0) return undefined;
	const strength = Math.round(Math.min(1, Math.abs(value) / scale) * MAX_TINT);
	const favorable = invert ? value < 0 : value > 0;
	const color = favorable ? 'var(--color-positive)' : 'var(--color-negative)';
	return `color-mix(in oklab, ${color} ${strength}%, transparent)`;
}
