<script lang="ts">
	import List from '@lucide/svelte/icons/list';
	import X from '@lucide/svelte/icons/x';
	import type { Range } from '$lib/domain/entities/Range';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import WatchlistPanel from './WatchlistPanel.svelte';

	interface Props {
		range: Range;
		current?: string | undefined;
	}

	let { range, current }: Props = $props();

	let dialog = $state<HTMLDialogElement>();

	function close(): void {
		dialog?.close();
	}

	/** Light-dismiss fallback for browsers without the closedby attribute. */
	function onBackdropClick(event: MouseEvent): void {
		if (!dialog || 'closedBy' in HTMLDialogElement.prototype || event.target !== dialog) return;
		const rect = dialog.getBoundingClientRect();
		const inside =
			rect.top <= event.clientY &&
			event.clientY <= rect.bottom &&
			rect.left <= event.clientX &&
			event.clientX <= rect.right;
		if (!inside) close();
	}
</script>

<button
	type="button"
	class="grid size-9 place-items-center rounded-md border border-line text-ink-muted hover:bg-surface-muted hover:text-ink lg:hidden"
	aria-label={i18n.t.watchlist.open}
	aria-haspopup="dialog"
	onclick={() => dialog?.showModal()}
>
	<List class="size-4" aria-hidden="true" />
</button>

<dialog
	bind:this={dialog}
	closedby="any"
	aria-labelledby="watchlist-sheet-title"
	class="sheet mt-auto mb-0 max-h-[80dvh] w-full max-w-none rounded-t-lg border border-line bg-surface p-0 text-ink"
	onclick={onBackdropClick}
>
	<div class="flex items-center justify-between border-b border-line px-4 py-3">
		<h2 id="watchlist-sheet-title" class="text-sm font-semibold">{i18n.t.watchlist.sheetTitle}</h2>
		<button
			type="button"
			class="rounded-sm p-1 text-ink-muted hover:text-ink"
			aria-label={i18n.t.watchlist.close}
			onclick={close}
		>
			<X class="size-4" aria-hidden="true" />
		</button>
	</div>
	<div class="overflow-y-auto p-4">
		<WatchlistPanel {range} {current} onNavigate={close} />
	</div>
</dialog>
