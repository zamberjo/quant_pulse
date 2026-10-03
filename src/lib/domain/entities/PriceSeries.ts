import type { PriceBar } from './PriceBar';
import type { Ticker } from './Ticker';

export interface PriceSeries {
	readonly ticker: Ticker;
	readonly currency: string;
	/** Exchange offset from UTC, used to derive local session dates. */
	readonly utcOffsetSeconds: number;
	readonly bars: readonly PriceBar[];
}
