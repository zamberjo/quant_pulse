<script lang="ts">
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import { theme } from '$lib/ui/state/theme.svelte';

	$effect(() => theme.sync());
</script>

<button
	type="button"
	class="grid size-9 place-items-center rounded-md border border-line text-ink-muted hover:bg-surface-muted hover:text-ink"
	aria-label={i18n.t.layout.darkTheme}
	aria-pressed={theme.current === 'dark'}
	onclick={() => theme.toggle()}
>
	{#if theme.current === 'dark'}
		<Sun class="size-4" aria-hidden="true" />
	{:else}
		<Moon class="size-4" aria-hidden="true" />
	{/if}
</button>
