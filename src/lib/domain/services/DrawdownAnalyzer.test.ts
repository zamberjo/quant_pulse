import { describe, expect, it } from 'vitest';
import { analyzeDrawdowns } from './DrawdownAnalyzer';
import { sessionPoints } from './testing';

describe('DrawdownAnalyzer', () => {
	it('finds the maximum drawdown, its recovery and the current drawdown', () => {
		const analysis = analyzeDrawdowns(
			sessionPoints([
				['2024-01-01', 100],
				['2024-01-02', 120],
				['2024-01-03', 90],
				['2024-01-04', 60],
				['2024-01-05', 130],
				['2024-01-06', 125]
			])
		);
		expect(analysis.maximum).toEqual({
			depth: -0.5,
			peakDate: '2024-01-02',
			troughDate: '2024-01-04',
			recoveryDate: '2024-01-05',
			durationDays: 3
		});
		expect(analysis.current).toBeCloseTo(125 / 130 - 1, 10);
	});

	it('reports unrecovered drawdowns up to the latest session', () => {
		const analysis = analyzeDrawdowns(
			sessionPoints([
				['2024-01-01', 100],
				['2024-01-11', 80],
				['2024-01-21', 90]
			])
		);
		expect(analysis.maximum?.recoveryDate).toBeNull();
		expect(analysis.maximum?.durationDays).toBe(20);
	});

	it('returns no episode for a monotonically rising series', () => {
		const analysis = analyzeDrawdowns(
			sessionPoints([
				['2024-01-01', 1],
				['2024-01-02', 2]
			])
		);
		expect(analysis).toEqual({ maximum: null, current: 0 });
	});
});
