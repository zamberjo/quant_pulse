export interface PriceBar {
	/** Session open as a UTC epoch in milliseconds. */
	readonly time: number;
	readonly close: number;
	/** Close adjusted for splits and distributions; equals close when unavailable. */
	readonly adjustedClose: number;
	readonly volume: number;
}
