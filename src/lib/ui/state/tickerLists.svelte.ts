import type { ManageTickerList } from '$lib/application/use-cases/ManageTickerList';
import type { Ticker } from '$lib/domain/entities/Ticker';
import { container } from '$lib/composition/container';

class TickerListState {
	items = $state<Ticker[]>([]);
	#useCase: ManageTickerList | null = null;

	constructor(private readonly select: () => ManageTickerList) {}

	get #list(): ManageTickerList {
		this.#useCase ??= this.select();
		return this.#useCase;
	}

	load(): void {
		this.items = this.#list.list();
	}

	has(ticker: Ticker): boolean {
		return this.items.includes(ticker);
	}

	add(ticker: Ticker): void {
		this.items = this.#list.add(ticker);
	}

	remove(ticker: Ticker): void {
		this.items = this.#list.remove(ticker);
	}

	toggle(ticker: Ticker): void {
		this.items = this.#list.toggle(ticker);
	}
}

export const watchlist = new TickerListState(() => container().watchlist);
export const recentTickers = new TickerListState(() => container().recentTickers);
