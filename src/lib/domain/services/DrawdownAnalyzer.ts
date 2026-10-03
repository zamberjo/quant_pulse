import type { SessionPoint } from './calendar';
import { daysBetween } from './calendar';

export interface DrawdownEpisode {
	/** Peak-to-trough decline as a negative fraction. */
	readonly depth: number;
	readonly peakDate: string;
	readonly troughDate: string;
	readonly recoveryDate: string | null;
	/** Calendar days from peak to recovery, or to the latest session when not recovered. */
	readonly durationDays: number;
}

export interface DrawdownAnalysis {
	readonly maximum: DrawdownEpisode | null;
	readonly current: number;
}

export function analyzeDrawdowns(points: readonly SessionPoint[]): DrawdownAnalysis {
	const first = points[0];
	const last = points.at(-1);
	if (!first || !last) return { maximum: null, current: 0 };

	let peak = first;
	let worst = { depth: 0, peak: first, trough: first };
	for (const point of points) {
		if (point.value > peak.value) peak = point;
		const depth = point.value / peak.value - 1;
		if (depth < worst.depth) worst = { depth, peak, trough: point };
	}

	const current = last.value / peak.value - 1;
	if (worst.depth === 0) return { maximum: null, current };

	const recovery = points.find(
		(point) => point.date.epochDay > worst.trough.date.epochDay && point.value >= worst.peak.value
	);
	return {
		maximum: {
			depth: worst.depth,
			peakDate: worst.peak.date.iso,
			troughDate: worst.trough.date.iso,
			recoveryDate: recovery?.date.iso ?? null,
			durationDays: daysBetween(worst.peak.date, (recovery ?? last).date)
		},
		current
	};
}
