import { InsufficientDataError } from '../errors/DomainError';

export function valueAt(values: readonly number[], index: number): number {
	const value = values[index];
	if (value === undefined) throw new RangeError(`Index ${index} is out of bounds.`);
	return value;
}

function requireLength(values: readonly number[], minimum: number): void {
	if (values.length < minimum) throw new InsufficientDataError(minimum, values.length);
}

export function sum(values: readonly number[]): number {
	let total = 0;
	for (const value of values) total += value;
	return total;
}

export function mean(values: readonly number[]): number {
	requireLength(values, 1);
	return sum(values) / values.length;
}

/** Unbiased sample variance (n − 1 denominator). */
export function sampleVariance(values: readonly number[]): number {
	requireLength(values, 2);
	const average = mean(values);
	let squares = 0;
	for (const value of values) squares += (value - average) ** 2;
	return squares / (values.length - 1);
}

export function sampleStandardDeviation(values: readonly number[]): number {
	return Math.sqrt(sampleVariance(values));
}

export function sortAscending(values: readonly number[]): number[] {
	return Array.from(Float64Array.from(values).sort());
}

/** Linear interpolation between closest ranks (Hyndman–Fan type 7) on pre-sorted values. */
export function quantile(sorted: readonly number[], probability: number): number {
	requireLength(sorted, 1);
	const position = (sorted.length - 1) * probability;
	const lower = Math.floor(position);
	const upper = Math.ceil(position);
	const lowerValue = valueAt(sorted, lower);
	return lowerValue + (valueAt(sorted, upper) - lowerValue) * (position - lower);
}

export function median(values: readonly number[]): number {
	return quantile(sortAscending(values), 0.5);
}

function centralMoments(values: readonly number[]): { m2: number; m3: number; m4: number } {
	const average = mean(values);
	let m2 = 0;
	let m3 = 0;
	let m4 = 0;
	for (const value of values) {
		const deviation = value - average;
		const squared = deviation * deviation;
		m2 += squared;
		m3 += squared * deviation;
		m4 += squared * squared;
	}
	const n = values.length;
	return { m2: m2 / n, m3: m3 / n, m4: m4 / n };
}

/** Adjusted Fisher–Pearson sample skewness (G1); null when undefined. */
export function skewness(values: readonly number[]): number | null {
	const n = values.length;
	if (n < 3) return null;
	const { m2, m3 } = centralMoments(values);
	if (m2 === 0) return null;
	return (Math.sqrt(n * (n - 1)) / (n - 2)) * (m3 / m2 ** 1.5);
}

/** Bias-corrected sample excess kurtosis (G2); null when undefined. */
export function excessKurtosis(values: readonly number[]): number | null {
	const n = values.length;
	if (n < 4) return null;
	const { m2, m4 } = centralMoments(values);
	if (m2 === 0) return null;
	const g2 = m4 / (m2 * m2) - 3;
	return (((n + 1) * g2 + 6) * (n - 1)) / ((n - 2) * (n - 3));
}

export interface DistributionSummary {
	readonly count: number;
	readonly mean: number;
	readonly median: number;
	readonly standardDeviation: number;
	readonly skewness: number | null;
	readonly excessKurtosis: number | null;
	readonly positiveRatio: number;
}

export function describeDistribution(values: readonly number[]): DistributionSummary {
	requireLength(values, 2);
	return {
		count: values.length,
		mean: mean(values),
		median: median(values),
		standardDeviation: sampleStandardDeviation(values),
		skewness: skewness(values),
		excessKurtosis: excessKurtosis(values),
		positiveRatio: values.filter((value) => value > 0).length / values.length
	};
}
