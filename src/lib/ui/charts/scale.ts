export interface LinearScale {
	readonly min: number;
	readonly max: number;
	readonly ticks: readonly number[];
}

function niceStep(span: number, count: number): number {
	const raw = span / count;
	const magnitude = 10 ** Math.floor(Math.log10(raw));
	const normalized = raw / magnitude;
	const nice =
		normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
	return nice * magnitude;
}

/** Zero-anchored domain rounded outward to "nice" tick steps (1, 2, 2.5, 5 × 10ⁿ). */
export function niceScale(values: readonly number[], tickCount = 4): LinearScale {
	let low = 0;
	let high = 0;
	for (const value of values) {
		if (value < low) low = value;
		if (value > high) high = value;
	}
	if (low === high) high = 0.01;
	const step = niceStep(high - low, tickCount);
	const min = Math.floor(low / step) * step;
	const max = Math.ceil(high / step) * step;
	const ticks: number[] = [];
	for (let tick = min; tick <= max + step / 2; tick += step) {
		ticks.push(Number(tick.toPrecision(12)));
	}
	return { min, max, ticks };
}

export function barPath(
	x: number,
	width: number,
	baseline: number,
	end: number,
	radius: number
): string {
	const height = Math.abs(end - baseline);
	if (height === 0 || width <= 0) return '';
	const r = Math.min(radius, width / 2, height);
	const direction = end < baseline ? 1 : -1;
	const inner = end + direction * r;
	return [
		`M${x},${baseline}`,
		`V${inner}`,
		`Q${x},${end} ${x + r},${end}`,
		`H${x + width - r}`,
		`Q${x + width},${end} ${x + width},${inner}`,
		`V${baseline}`,
		'Z'
	].join('');
}
