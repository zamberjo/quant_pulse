import { describe, expect, it } from 'vitest';
import {
	annualizedVolatility,
	calmarRatio,
	conditionalValueAtRisk,
	downsideDeviation,
	historicalValueAtRisk,
	sharpeRatio,
	sortinoRatio
} from './RiskMetrics';

const RETURNS = [0.01, -0.005, 0.02, 0, 0.015, -0.01];
const RISK_FREE = 0.02;
const PERIODS = 252;

describe('RiskMetrics', () => {
	it('annualizes volatility with √252', () => {
		expect(annualizedVolatility(RETURNS, PERIODS)).toBeCloseTo(0.18783, 5);
	});

	it('computes Sharpe and Sortino ratios against the risk-free rate', () => {
		expect(sharpeRatio(RETURNS, RISK_FREE, PERIODS)).toBeCloseTo(6.601725, 5);
		expect(downsideDeviation(RETURNS, RISK_FREE / PERIODS, PERIODS)).toBeCloseTo(0.073149, 5);
		expect(sortinoRatio(RETURNS, RISK_FREE, PERIODS)).toBeCloseTo(16.951674, 4);
	});

	it('returns null ratios when risk is zero', () => {
		expect(sharpeRatio([0.01, 0.01, 0.01], 0, PERIODS)).toBeNull();
		expect(sortinoRatio([0.01, 0.02], 0, PERIODS)).toBeNull();
		expect(calmarRatio(0.1, 0)).toBeNull();
		expect(calmarRatio(0.1, -0.25)).toBeCloseTo(0.4, 10);
	});

	it('computes historical VaR and expected shortfall', () => {
		const returns = Array.from({ length: 20 }, (_, index) => (index - 10) / 100);
		expect(historicalValueAtRisk(returns, 0.95)).toBeCloseTo(-0.0905, 10);
		expect(conditionalValueAtRisk(returns, 0.95)).toBeCloseTo(-0.1, 10);
	});
});
