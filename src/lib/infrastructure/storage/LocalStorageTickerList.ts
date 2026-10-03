import { isValidTicker, type Ticker } from '$lib/domain/entities/Ticker';
import type { TickerListPort } from '$lib/domain/ports/TickerListPort';

export class LocalStorageTickerList implements TickerListPort {
	constructor(
		private readonly storage: Storage | null,
		private readonly key: string
	) {}

	load(): Ticker[] {
		try {
			const parsed: unknown = JSON.parse(this.storage?.getItem(this.key) ?? '[]');
			if (!Array.isArray(parsed)) return [];
			return parsed.filter(
				(entry): entry is Ticker => typeof entry === 'string' && isValidTicker(entry)
			);
		} catch {
			return [];
		}
	}

	save(tickers: readonly Ticker[]): void {
		try {
			this.storage?.setItem(this.key, JSON.stringify(tickers));
		} catch {
			return;
		}
	}
}
