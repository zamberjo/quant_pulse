import { describe, expect, it } from 'vitest';
import { calendarMatrix, monthlyReturns, weekdayAverages } from './PeriodAggregator';
import { sessionPoints } from './testing';

describe('PeriodAggregator', () => {
	const points = sessionPoints([
		['2024-01-02', 100],
		['2024-01-31', 110],
		['2024-02-15', 99],
		['2024-02-29', 121],
		['2024-03-01', 133.1]
	]);

	it('compounds calendar-month returns from prior month-end closes', () => {
		const monthly = monthlyReturns(points);
		expect(monthly.map(({ year, month }) => [year, month])).toEqual([
			[2024, 1],
			[2024, 2],
			[2024, 3]
		]);
		monthly.forEach(({ value }) => expect(value).toBeCloseTo(0.1, 10));
	});

	it('builds a year × month matrix with compounded totals', () => {
		const [year] = calendarMatrix([
			...monthlyReturns(points),
			{ year: 2023, month: 12, value: 0.05 }
		]);
		expect(year?.year).toBe(2024);
		expect(year?.months.slice(0, 4).map((value) => value?.toFixed(4) ?? null)).toEqual([
			'0.1000',
			'0.1000',
			'0.1000',
			null
		]);
		expect(year?.total).toBeCloseTo(0.331, 10);
	});

	it('averages returns per ISO weekday, Monday first', () => {
		const averages = weekdayAverages(
			sessionPoints([
				['2024-01-03', 0.02],
				['2024-01-01', 0.01],
				['2024-01-08', 0.03],
				['2024-01-10', 0.04]
			])
		);
		expect(averages).toEqual([
			{ weekday: 1, mean: 0.02, count: 2 },
			{ weekday: 3, mean: 0.03, count: 2 }
		]);
	});
});
