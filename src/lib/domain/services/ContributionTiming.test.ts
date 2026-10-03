import { describe, expect, it } from 'vitest';
import { analyzeContributionTiming } from './ContributionTiming';
import { sessionPoints } from './testing';

function month(year: number, month: number, prices: Record<number, number>): [string, number][] {
	const pad = (value: number) => String(value).padStart(2, '0');
	return Object.entries(prices).map(([day, price]) => [
		`${year}-${pad(month)}-${pad(Number(day))}`,
		price
	]);
}

describe('analyzeContributionTiming', () => {
	// February 2024: sessions on the 1st, 2nd, 5th and 29th (weekend on 3–4).
	const february = month(2024, 2, { 1: 100, 2: 90, 5: 110, 29: 100 });
	// March 2024: sessions on the 1st, 4th and 29th.
	const march = month(2024, 3, { 1: 120, 4: 100, 29: 80 });

	it('prices each scheduled day at the next session, or the last one for missing days', () => {
		const timing = analyzeContributionTiming(sessionPoints([...february, ...march]));
		const [feb] = timing.history;
		expect(feb?.premiums.slice(0, 6).map((value) => value?.toFixed(3))).toEqual([
			'0.000',
			'-0.100',
			'0.100',
			'0.100',
			'0.100',
			'0.000'
		]);
		expect(feb?.premiums[29]).toBe(0);
		expect(feb?.premiums[30]).toBe(0);
	});

	it('falls back to the last session when the scheduled day is after it', () => {
		const timing = analyzeContributionTiming(sessionPoints([...february, ...march]));
		const mar = timing.history[1];
		expect(mar?.premiums[29]).toBeCloseTo(80 / 100 - 1, 10);
		expect(mar?.premiums[30]).toBeCloseTo(80 / 100 - 1, 10);
	});

	it('ranks days by their average premium and counts cheapest occurrences', () => {
		const timing = analyzeContributionTiming(sessionPoints([...february, ...march]));
		expect(timing.months).toBe(2);
		const day2 = timing.byDay.find((entry) => entry.day === 2);
		expect(day2?.meanPremium).toBeCloseTo(-0.05, 10);
		expect(day2?.cheapestShare).toBe(0.5);
		expect(timing.byDay.every((entry) => entry.observations === 2)).toBe(true);
		expect(timing.bestDay?.day).toBe(6);
		expect(timing.worstDay?.day).toBe(1);
	});

	it('profiles each month of the year across years', () => {
		const timing = analyzeContributionTiming(
			sessionPoints([...month(2023, 2, { 1: 100, 28: 110 }), ...month(2024, 2, { 1: 100, 29: 90 })])
		);
		const profile = timing.byMonthOfYear[1];
		expect(profile?.years).toBe(2);
		expect(profile?.meanPremiums[0]).toBeCloseTo((100 / 105 - 1 + 100 / 95 - 1) / 2, 10);
		expect(timing.firstYear).toBe(2023);
		expect(timing.lastYear).toBe(2024);
	});

	it('ignores partial months at the edges of the range', () => {
		const timing = analyzeContributionTiming(
			sessionPoints([
				...month(2024, 1, { 15: 100, 31: 101 }),
				...february,
				...month(2024, 3, { 1: 1 })
			])
		);
		expect(timing.months).toBe(1);
		expect(timing.history[0]?.month).toBe(2);
	});

	it('returns an empty analysis without complete months', () => {
		const timing = analyzeContributionTiming(sessionPoints(month(2024, 1, { 10: 100, 12: 101 })));
		expect(timing).toMatchObject({ months: 0, bestDay: null, worstDay: null, byDay: [] });
	});
});
