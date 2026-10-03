import { describe, expect, it } from 'vitest';
import {
	compound,
	compoundAnnualGrowthRate,
	logReturns,
	simpleReturns,
	totalReturn,
	trailingReturns
} from './ReturnsCalculator';
import { sessionPoints } from './testing';

describe('ReturnsCalculator', () => {
	const prices = [100, 110, 99, 108.9];

	it('computes simple and log returns', () => {
		const returns = simpleReturns(prices);
		expect(returns).toHaveLength(3);
		returns.forEach((value, index) =>
			expect(value).toBeCloseTo([0.1, -0.1, 0.1][index] ?? NaN, 10)
		);
		expect(logReturns([100, 110])[0]).toBeCloseTo(Math.log(1.1), 10);
	});

	it('computes total and compounded returns consistently', () => {
		expect(totalReturn(prices)).toBeCloseTo(0.089, 10);
		expect(compound(simpleReturns(prices))).toBeCloseTo(0.089, 10);
	});

	it('annualizes growth over calendar days', () => {
		expect(compoundAnnualGrowthRate(0.21, 730.5)).toBeCloseTo(0.1, 10);
		expect(compoundAnnualGrowthRate(0.1, 0)).toBeNull();
	});

	it('measures trailing windows from the last close on or before the window start', () => {
		const points = sessionPoints([
			['2023-12-29', 80],
			['2024-01-02', 90],
			['2024-02-15', 100],
			['2024-03-14', 105],
			['2024-03-15', 110]
		]);
		const byPeriod = Object.fromEntries(
			trailingReturns(points).map((entry) => [entry.period, entry.value])
		);
		expect(byPeriod['1M']).toBeCloseTo(110 / 100 - 1, 10);
		expect(byPeriod['YTD']).toBeCloseTo(110 / 80 - 1, 10);
		expect(byPeriod['3M']).toBeNull();
		expect(byPeriod['1Y']).toBeNull();
	});
});
