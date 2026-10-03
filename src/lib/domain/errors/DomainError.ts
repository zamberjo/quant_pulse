export type DomainErrorCode =
	| 'INVALID_TICKER'
	| 'TICKER_NOT_FOUND'
	| 'INSUFFICIENT_DATA'
	| 'MARKET_DATA_UNAVAILABLE'
	| 'RATE_LIMITED';

export abstract class DomainError extends Error {
	abstract readonly code: DomainErrorCode;
}

export class InvalidTickerError extends DomainError {
	readonly code = 'INVALID_TICKER';
	override readonly name = 'InvalidTickerError';

	constructor(readonly input: string) {
		super(`"${input}" is not a valid ticker symbol.`);
	}
}

export class TickerNotFoundError extends DomainError {
	readonly code = 'TICKER_NOT_FOUND';
	override readonly name = 'TickerNotFoundError';

	constructor(readonly ticker: string) {
		super(`No market data found for ${ticker}.`);
	}
}

export class InsufficientDataError extends DomainError {
	readonly code = 'INSUFFICIENT_DATA';
	override readonly name = 'InsufficientDataError';

	constructor(
		readonly required: number,
		readonly available: number
	) {
		super(`At least ${required} observations are required, ${available} available.`);
	}
}

export type UnavailabilityReason =
	'offline' | 'network' | 'proxy' | 'upstream' | 'invalid-response';

export class MarketDataUnavailableError extends DomainError {
	readonly code = 'MARKET_DATA_UNAVAILABLE';
	override readonly name = 'MarketDataUnavailableError';

	constructor(readonly reason: UnavailabilityReason) {
		super(`Market data is unavailable (${reason}).`);
	}
}

export class RateLimitedError extends DomainError {
	readonly code = 'RATE_LIMITED';
	override readonly name = 'RateLimitedError';

	constructor() {
		super('The market data provider is rate limiting requests.');
	}
}
