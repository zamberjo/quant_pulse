import { describe, expect, it } from 'vitest';
import { parseTicker, type Ticker } from '$lib/domain/entities/Ticker';
import type { TickerListPort } from '$lib/domain/ports/TickerListPort';
import { ManageTickerList } from './ManageTickerList';

class MemoryList implements TickerListPort {
	tickers: Ticker[] = [];
	load(): Ticker[] {
		return [...this.tickers];
	}
	save(tickers: readonly Ticker[]): void {
		this.tickers = [...tickers];
	}
}

describe('ManageTickerList', () => {
	const [a, b, c] = ['AAA', 'BBB', 'CCC'].map(parseTicker) as [Ticker, Ticker, Ticker];

	it('keeps the most recent entries first within capacity', () => {
		const list = new ManageTickerList(new MemoryList(), 2);
		list.add(a);
		list.add(b);
		expect(list.add(c)).toEqual([c, b]);
		expect(list.add(b)).toEqual([b, c]);
	});

	it('toggles membership', () => {
		const list = new ManageTickerList(new MemoryList(), 5);
		expect(list.toggle(a)).toEqual([a]);
		expect(list.toggle(a)).toEqual([]);
	});
});
