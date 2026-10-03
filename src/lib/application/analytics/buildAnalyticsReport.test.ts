import { describe, expect, it } from 'vitest';
import type { PriceSeries } from '$lib/domain/entities/PriceSeries';
import { parseTicker } from '$lib/domain/entities/Ticker';
import { InsufficientDataError } from '$lib/domain/errors/DomainError';
import { buildAnalyticsReport } from './buildAnalyticsReport';

const SETTINGS = { riskFreeRate: 0, periodsPerYear: 252 };
/** 14:30 UTC session opens with a −4h exchange offset fall on the same local calendar day. */
const OPEN_UTC_HOUR = 14.5 * 3_600_000;

function series(closes: readonly number[]): PriceSeries {
	const start = Date.UTC(2024, 0, 1);
	return {
		ticker: parseTicker('TEST'),
		currency: 'USD',
		utcOffsetSeconds: -14_400,
		bars: closes.map((close, index) => ({
			time: start + index * 86_400_000 + OPEN_UTC_HOUR,
			close,
			adjustedClose: close,
			volume: 0
		}))
	};
}

describe('buildAnalyticsReport', () => {
	it('assembles returns, risk and distribution from adjusted closes', () => {
		const report = buildAnalyticsReport(series([100, 110, 99, 108.9, 119.79]), SETTINGS);
		expect(report.period).toEqual({
			startDate: '2024-01-01',
			endDate: '2024-01-05',
			sessions: 5,
			calendarDays: 4
		});
		expect(report.returns.cumulative).toBeCloseTo(0.1979, 10);
		expect(report.dailyReturns.map((entry) => entry.date)).toEqual([
			'2024-01-02',
			'2024-01-03',
			'2024-01-04',
			'2024-01-05'
		]);
		expect(report.distribution.bestDay.value).toBeCloseTo(0.1, 10);
		expect(report.distribution.worstDay).toMatchObject({ date: '2024-01-03' });
		expect(report.risk.maxDrawdown?.depth).toBeCloseTo(-0.1, 10);
		expect(report.risk.maxDrawdown?.recoveryDate).toBe('2024-01-05');
		expect(report.distribution.positiveRatio).toBeCloseTo(0.75, 10);
		expect(report.calendar).toHaveLength(1);
		expect(report.weekdays.map((entry) => entry.weekday)).toEqual([2, 3, 4, 5]);
	});

	it('requires a minimum number of sessions', () => {
		expect(() => buildAnalyticsReport(series([100, 101]), SETTINGS)).toThrow(InsufficientDataError);
	});
});
