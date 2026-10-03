<script lang="ts">
	import { i18n, LOCALE_NAMES, LOCALES } from '$lib/ui/i18n/i18n.svelte';
</script>

<div
	class="flex h-9 items-center rounded-md border border-line p-0.5"
	role="group"
	aria-label={i18n.t.layout.language}
>
	{#each LOCALES as locale (locale)}
		<button
			type="button"
			lang={locale}
			aria-label={LOCALE_NAMES[locale]}
			aria-pressed={i18n.locale === locale}
			onclick={() => i18n.set(locale)}
			class={[
				'h-full rounded-[0.25rem] px-2 num text-xs font-medium uppercase',
				i18n.locale === locale
					? 'bg-accent text-on-accent'
					: 'text-ink-muted hover:bg-surface-muted hover:text-ink'
			]}
		>
			{locale}
		</button>
	{/each}
</div>
