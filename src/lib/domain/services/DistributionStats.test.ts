import { describe, expect, it } from 'vitest';
import { InsufficientDataError } from '../errors/DomainError';
import {
	describeDistribution,
	excessKurtosis,
	mean,
	median,
	quantile,
	sampleStandardDeviation,
	skewness
} from './DistributionStats';

const SAMPLE = [0.01, -0.005, 0.02, 0, 0.015, -0.04];

describe('DistributionStats', () => {
	it('computes mean and unbiased sample standard deviation', () => {
		expect(mean([0.1, -0.1, 0.1])).toBeCloseTo(0.033333, 6);
		expect(sampleStandardDeviation([0.1, -0.1, 0.1])).toBeCloseTo(0.11547, 5);
	});

	it('interpolates quantiles linearly between closest ranks', () => {
		expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
		expect(quantile([1, 2, 3, 4], 0.25)).toBeCloseTo(1.75, 10);
		expect(median([5, 1, 3])).toBe(3);
	});

	it('computes bias-corrected skewness and excess kurtosis', () => {
		expect(skewness(SAMPLE)).toBeCloseTo(-1.523649, 5);
		expect(excessKurtosis(SAMPLE)).toBeCloseTo(2.563377, 5);
	});

	it('returns null for undefined higher moments', () => {
		expect(skewness([1, 2])).toBeNull();
		expect(excessKurtosis([1, 1, 1, 1])).toBeNull();
	});

	it('summarizes a distribution', () => {
		const summary = describeDistribution(SAMPLE);
		expect(summary.count).toBe(6);
		expect(summary.positiveRatio).toBeCloseTo(0.5, 10);
		expect(summary.median).toBeCloseTo(0.005, 10);
	});

	it('rejects insufficient data instead of producing NaN', () => {
		expect(() => mean([])).toThrow(InsufficientDataError);
		expect(() => sampleStandardDeviation([1])).toThrow(InsufficientDataError);
	});
});
