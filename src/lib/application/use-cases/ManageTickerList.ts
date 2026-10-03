import type { Ticker } from '$lib/domain/entities/Ticker';
import type { TickerListPort } from '$lib/domain/ports/TickerListPort';

export class ManageTickerList {
	constructor(
		private readonly store: TickerListPort,
		private readonly capacity: number
	) {}

	list(): Ticker[] {
		return this.store.load();
	}

	add(ticker: Ticker): Ticker[] {
		return this.#save([ticker, ...this.list().filter((entry) => entry !== ticker)]);
	}

	remove(ticker: Ticker): Ticker[] {
		return this.#save(this.list().filter((entry) => entry !== ticker));
	}

	toggle(ticker: Ticker): Ticker[] {
		return this.list().includes(ticker) ? this.remove(ticker) : this.add(ticker);
	}

	#save(tickers: Ticker[]): Ticker[] {
		const bounded = tickers.slice(0, this.capacity);
		this.store.save(bounded);
		return bounded;
	}
}
