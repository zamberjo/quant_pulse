import { mean, quantile, sampleStandardDeviation, sortAscending } from './DistributionStats';

/** Sample standard deviation of periodic returns scaled by √(periods per year). */
export function annualizedVolatility(returns: readonly number[], periodsPerYear: number): number {
	return sampleStandardDeviation(returns) * Math.sqrt(periodsPerYear);
}

/** Root mean square of shortfalls below the per-period target, scaled by √(periods per year). */
export function downsideDeviation(
	returns: readonly number[],
	periodTarget: number,
	periodsPerYear: number
): number {
	let squares = 0;
	for (const value of returns) squares += Math.min(value - periodTarget, 0) ** 2;
	return Math.sqrt(squares / returns.length) * Math.sqrt(periodsPerYear);
}

function annualizedExcessReturn(
	returns: readonly number[],
	riskFreeRate: number,
	periodsPerYear: number
): number {
	return (mean(returns) - riskFreeRate / periodsPerYear) * periodsPerYear;
}

/** Annualized arithmetic excess return over annualized volatility. */
export function sharpeRatio(
	returns: readonly number[],
	riskFreeRate: number,
	periodsPerYear: number
): number | null {
	const volatility = annualizedVolatility(returns, periodsPerYear);
	if (volatility === 0) return null;
	return annualizedExcessReturn(returns, riskFreeRate, periodsPerYear) / volatility;
}

/** Annualized arithmetic excess return over downside deviation relative to the risk-free rate. */
export function sortinoRatio(
	returns: readonly number[],
	riskFreeRate: number,
	periodsPerYear: number
): number | null {
	const downside = downsideDeviation(returns, riskFreeRate / periodsPerYear, periodsPerYear);
	if (downside === 0) return null;
	return annualizedExcessReturn(returns, riskFreeRate, periodsPerYear) / downside;
}

export function calmarRatio(cagr: number | null, maxDrawdown: number): number | null {
	if (cagr === null || maxDrawdown === 0) return null;
	return cagr / Math.abs(maxDrawdown);
}

/** Historical VaR expressed as the return at the (1 − confidence) quantile; negative means loss. */
export function historicalValueAtRisk(returns: readonly number[], confidence: number): number {
	return quantile(sortAscending(returns), 1 - confidence);
}

/** Expected shortfall: mean of returns at or below the historical VaR threshold. */
export function conditionalValueAtRisk(returns: readonly number[], confidence: number): number {
	const threshold = historicalValueAtRisk(returns, confidence);
	return mean(returns.filter((value) => value <= threshold));
}
