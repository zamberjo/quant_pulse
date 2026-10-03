<script lang="ts">
	import type { Component } from 'svelte';
	import Info from '@lucide/svelte/icons/info';
	import type { Tone } from '$lib/ui/formatters/number';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';

	interface Props {
		label: string;
		value: string;
		caption: string;
		formula: string;
		icon: Component<{ class?: string; 'aria-hidden'?: boolean | 'true' }>;
		tone?: Tone;
	}

	let { label, value, caption, formula, icon: Icon, tone = 'neutral' }: Props = $props();

	const id = $props.id();
</script>

<article class="panel flex flex-col gap-3 p-4" aria-labelledby="{id}-label">
	<header class="flex items-center justify-between gap-2">
		<h3 id="{id}-label" class="eyebrow flex items-center gap-2">
			<Icon class="size-3.5 text-accent-soft" aria-hidden="true" />
			{label}
		</h3>
		<button
			type="button"
			class="rounded-sm p-0.5 text-ink-muted hover:text-ink"
			popovertarget="{id}-formula"
			aria-label={i18n.t.metrics.howCalculated(label)}
			aria-describedby="{id}-formula"
		>
			<Info class="size-3.5" aria-hidden="true" />
		</button>
		<div id="{id}-formula" popover role="tooltip" class="tooltip">{formula}</div>
	</header>
	<p
		class={[
			'num text-2xl leading-none font-semibold tracking-tight',
			tone === 'positive' && 'text-positive',
			tone === 'negative' && 'text-negative'
		]}
	>
		{value}
	</p>
	<p class="text-xs leading-snug text-ink-muted">{caption}</p>
</article>
